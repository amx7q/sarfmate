# Recording suggestions in Supabase

Community suggestions ("Suggest a root" and "Notice an error") are always
saved to the visitor's browser (localStorage). When Supabase is configured,
each submission is *also* sent to a `submissions` table so the SarfMate team
actually receives it.

The table is a **write-only drop-box**: anonymous visitors can insert a row
but can never read, update, or delete anything (enforced by Row Level
Security). You read submissions in the Supabase dashboard.

## One-time setup

1. Create a free project at [supabase.com](https://supabase.com) (any region).
2. In the project, open **SQL Editor**, paste the contents of
   [`supabase/schema.sql`](../supabase/schema.sql), and run it.
3. In **Project Settings → API**, copy:
   - the **Project URL** (looks like `https://xyzcompany.supabase.co`)
   - the **anon public** API key
4. Locally: copy `.env.example` to `.env.local` and fill in both values.
5. On Cloudflare (Pages/Workers): add the same two variables as **build-time
   environment variables**. `NEXT_PUBLIC_*` values are inlined into the
   client bundle when `next build` runs — setting them only as runtime
   secrets will not work. Redeploy after adding them.

### Existing SarfMate databases

If the `submissions` table already exists, do not rerun the full schema.
Review and run
[`20260710_submission_client_id_idempotency.sql`](../supabase/migrations/20260710_submission_client_id_idempotency.sql)
instead. It fills missing legacy client IDs, separates any existing duplicate
IDs, then makes `client_id` required and unique so browser retries cannot add a
second row. The migration is idempotent and preserves anonymous INSERT-only
access.

## Reading submissions

Open the Supabase dashboard → **Table Editor** → `submissions`. Rows arrive
with `status = 'pending'`; you can edit the status column there as you triage
(e.g. `reviewed`, `applied`, `rejected`).

## Behaviour without configuration

If the env vars are absent (local dev, forks), submissions work exactly as
before: saved on-device, with Copy JSON and email fallbacks in the UI.
If a network send fails, the submission is still saved locally and the
success screen tells the visitor to use the fallbacks.

## Spam considerations

The insert policy is open to anonymous visitors by design. Abuse is bounded
by column length checks in the schema; if spam ever becomes a problem,
options include a honeypot form field, Cloudflare Turnstile, or rotating the
anon key.
