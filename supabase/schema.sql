-- SarfMate submissions table.
-- Run this once in the Supabase SQL Editor (see docs/SUPABASE.md).
--
-- Design: a write-only drop-box. Anonymous visitors can INSERT a suggestion
-- but can never read, update, or delete rows. The owner reads rows in the
-- Supabase dashboard (the service role bypasses RLS).

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('root_suggestion', 'error_report')),
  root text not null check (char_length(root) between 1 and 40),
  form_key text check (form_key in (
    'past', 'present', 'imperative',
    'place_or_mim_masdar', 'active_participle', 'passive_participle'
  )),
  current_value text check (char_length(current_value) <= 500),
  suggested_correction text not null
    check (char_length(suggested_correction) between 1 and 2000),
  explanation text check (char_length(explanation) <= 2000),
  contributor_name text check (char_length(contributor_name) <= 200),
  contributor_email text check (char_length(contributor_email) <= 320),
  -- The submission id generated in the visitor's browser, so a row can be
  -- cross-referenced with the JSON the visitor may also copy or email.
  client_id text check (char_length(client_id) <= 100),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "anon_insert_only" on public.submissions
  for insert to anon with check (true);

-- Deliberately no select/update/delete policies for anon.
