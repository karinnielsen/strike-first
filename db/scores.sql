-- Strike First - the scores table. UNR-106.
--
-- Run once in the Supabase SQL Editor. This file is the record of what
-- the database looks like; change it here first, then run the change.
--
-- The page holds only the publishable key, and everything below is what
-- stops that key doing more than submitting and reading scores. Whether a
-- score is *possible* is a separate question, and lives in UNR-132.

create table public.scores (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  initials    text not null check (initials ~ '^[A-Z]{3}$'),
  dojo        text not null check (dojo in ('cobra-kai', 'miyagi-do', 'eagle-fang')),
  score       int  not null check (score >= 0),
  belt        text not null,  -- rank held when the run ended
  length      int  not null check (length >= 3),
  moves       int  not null check (moves >= 0),
  duration_ms int  not null check (duration_ms >= 0),
  version     text not null   -- game version, so checks can follow balance changes
);

alter table public.scores enable row level security;

-- Explicit grants, so this works whether or not the project exposes new
-- tables to the API by default. The insert grant names its columns, which
-- is what stops the page choosing its own id or timestamp.
revoke all on public.scores from anon, authenticated;
grant select on public.scores to anon;
grant insert (initials, dojo, score, belt, length, moves, duration_ms, version)
  on public.scores to anon;

-- No update or delete policy exists, so a score can never be changed or
-- removed with the public key. A score also keeps the dojo it was earned
-- under, because nothing can rewrite the row.
create policy "anyone can read scores" on public.scores
  for select to anon using (true);
create policy "anyone can submit a score" on public.scores
  for insert to anon with check (true);
