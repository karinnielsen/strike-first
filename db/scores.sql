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
  initials    text not null check (initials ~ '^[A-Z]{3}$'),  -- and not blocked, below
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

-- ---------------------------------------------------------------------
-- The leaderboard. UNR-108.
-- ---------------------------------------------------------------------

-- Rude initials. The page carries the same list so the player hears about
-- it before signing, and test.js fails if the two ever differ.
alter table public.scores add constraint scores_initials_not_blocked
  check (initials not in (
    'KKK', 'NIG', 'NGR', 'FAG', 'NAZ',
    'CUM', 'SEX', 'TIT', 'DIK', 'DIC', 'COK',
    'FUK', 'FCK', 'FUC', 'CNT', 'SHT', 'ASS',
    'KYS'
  ));

-- Views run with the permissions of whoever reads them
-- (security_invoker), so row-level security above still applies. Without
-- it a view reads as its owner and would bypass every policy. Each needs
-- its own grant to anon.

-- The players' board. Every run is a row, placed by score; on a tie the
-- earlier run places higher, as it did on an arcade table.
create view public.leaderboard with (security_invoker = true) as
select id, created_at, initials, dojo, score, belt,
       row_number() over (order by score desc, id) as place
from public.scores;

-- Each dojo's players: a set of initials within a dojo, at their best,
-- placed within the dojo, with how many students the dojo has. A dojo's
-- standing is the sum of its best three, added up in the page, where the
-- team size is a named constant - it decides only what is displayed.
create view public.dojo_players with (security_invoker = true) as
select dojo, initials, best, place, students
from (
  select dojo, initials, max(score) as best,
         row_number() over (partition by dojo order by max(score) desc, min(id)) as place,
         count(*) over (partition by dojo) as students
  from public.scores
  group by dojo, initials
) players;

grant select on public.leaderboard  to anon;
grant select on public.dojo_players to anon;
