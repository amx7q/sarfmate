-- Makes browser submission retries idempotent without changing the existing
-- anonymous INSERT-only RLS design.
--
-- Review this file before running it in the Supabase SQL Editor. It is safe to
-- run more than once. Existing rows without a usable client_id, and duplicate
-- legacy rows after the first occurrence, receive stable IDs derived from the
-- database row UUID.

begin;

update public.submissions
set client_id = 'legacy-' || id::text
where client_id is null or btrim(client_id) = '';

with duplicate_rows as (
  select id
  from (
    select
      id,
      row_number() over (
        partition by client_id
        order by created_at asc, id asc
      ) as duplicate_number
    from public.submissions
  ) ranked
  where duplicate_number > 1
)
update public.submissions as submission
set client_id = 'legacy-duplicate-' || submission.id::text
from duplicate_rows
where submission.id = duplicate_rows.id;

alter table public.submissions
  alter column client_id set not null;

create unique index if not exists submissions_client_id_unique_idx
  on public.submissions (client_id);

-- Keep anonymous access write-only. RLS remains enabled and the existing
-- anon_insert_only policy remains the only anonymous policy.
revoke select, update, delete on table public.submissions from anon;
grant insert on table public.submissions to anon;

commit;
