-- Strike First - the scores table. UNR-106.
--
-- Run in the Supabase SQL Editor of both projects, production and sandbox.
-- This file is the record of what the database looks like; change it here
-- first, then run the change in each.
--
-- The page holds only the publishable key, and everything below is what
-- stops that key doing more than submitting and reading scores, and sending
-- feedback. Whether a score is *possible* is a separate question, answered
-- further down (UNR-132). Feedback is last (UNR-197).

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

-- ---------------------------------------------------------------------
-- Scores you can trust. UNR-132.
-- ---------------------------------------------------------------------

-- The score is counted in the browser, so a row can say anything. What a
-- row can't fake is agreeing with the rules: score, length, moves and
-- duration are tied to each other, and a row where they disagree is one
-- no game produced. The reasoning behind each limit is written out above
-- plausibleRun() in index.html, which runs the same check before sending.
-- test.js fails if the numbers here and in the page ever differ.
--
-- A refused run fails with 23514, the same as a check constraint, so the
-- permissions check in CLAUDE.md still reads the same way.
--
-- Submissions are also rate limited, per caller and across everyone. The
-- caller is known by a hash of their IP address, kept in a table the
-- public key can't read, and only for as long as the window lasts.
--
-- Safe to run more than once: everything is created if missing or replaced.

create table if not exists public.score_submissions (
  ip_hash text        not null,
  at      timestamptz not null default now()
);
create index if not exists score_submissions_at on public.score_submissions (at);

-- No grants and no policies: nothing but the trigger below can touch it.
alter table public.score_submissions enable row level security;
revoke all on public.score_submissions from anon, authenticated;

-- security definer so it can write the table above, which the inserting
-- role can't. search_path is emptied so nothing it names can be swapped
-- for something else; everything is written out in full.
create or replace function public.scores_plausible() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Balance, as in the page. When the game's balance changes, change it here.
  levels_from       constant int[]  := array[0, 8, 18, 30, 45, 65, 90, 120, 155];
  levels_ms         constant int[]  := array[260, 225, 195, 170, 145, 120, 100, 85, 70];
  belt_names        constant text[] := array['White', 'Orange', 'Green', 'Brown', 'Red', 'Cho Dan Bo', 'Midnight blue'];
  belt_from         constant int[]  := array[0, 15, 35, 65, 110, 175, 275];
  board_cells       constant int     := 441;
  points_per_move   constant numeric := 5.5;   -- an egg and a frog in a row, UNR-201
  points_per_square constant numeric := 5.5;
  timing_slack      constant numeric := 0.95;
  timing_slack_ms   constant int     := 1000;

  -- How many scores may arrive in a window. Only a new hi-score is ever
  -- signed, so a real player sends a handful; the limit across everyone
  -- is what still holds if an IP address can be made up.
  per_caller_limit  constant int      := 20;
  everyone_limit    constant int      := 300;
  rate_window       constant interval := '10 minutes';

  peak     numeric;
  most     numeric;
  delay    int;
  fastest  bigint := 0;
  earned   int := 1;
  headers  json;
  caller   text;
begin
  -- Length grows at most a square a move and can't outgrow the board.
  -- Checked first, because the loop below is bounded by length.
  if new.length > board_cells or new.length - 3 > new.moves then
    raise exception using errcode = '23514', message = 'implausible run: length';
  end if;

  peak := points_per_square * (new.length - 3);
  if new.score > peak then
    raise exception using errcode = '23514', message = 'implausible run: score';
  end if;

  -- The fastest the moves could have been made: the curve climbed as
  -- steeply as the score allows, then held. At most one pass per square.
  -- The loop variable is `made`, not `move`: MOVE is a PL/pgSQL keyword.
  for made in 1..new.moves loop
    most  := least(points_per_move * made, peak);
    delay := levels_ms[1];
    for level in 1..array_length(levels_from, 1) loop
      if most >= levels_from[level] then delay := levels_ms[level]; end if;
    end loop;
    if most = peak then
      fastest := fastest + (new.moves - made + 1)::bigint * delay;
      exit;
    end if;
    fastest := fastest + delay;
  end loop;

  if new.duration_ms < fastest * timing_slack - timing_slack_ms then
    raise exception using errcode = '23514', message = 'implausible run: duration';
  end if;

  -- Belt comes from your best, and your best is at least this run.
  for rank in 1..array_length(belt_from, 1) loop
    if new.score >= belt_from[rank] then earned := rank; end if;
  end loop;
  if coalesce(array_position(belt_names, new.belt), 0) < earned then
    raise exception using errcode = '23514', message = 'implausible run: belt';
  end if;

  -- The rate limit. Supabase passes the request's headers in; the
  -- Cloudflare one can't be set by the caller, so it is preferred.
  headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  caller  := coalesce(headers->>'cf-connecting-ip',
                      split_part(headers->>'x-forwarded-for', ',', 1), '');
  caller  := encode(sha256(convert_to(caller, 'UTF8')), 'hex');

  delete from public.score_submissions where at < now() - rate_window;
  if (select count(*) from public.score_submissions) >= everyone_limit
     or (select count(*) from public.score_submissions where ip_hash = caller) >= per_caller_limit then
    raise exception using errcode = 'P0001', message = 'too many scores, try again later';
  end if;
  insert into public.score_submissions (ip_hash) values (caller);

  return new;
end;
$$;

revoke all on function public.scores_plausible() from public, anon, authenticated;

drop trigger if exists scores_plausible on public.scores;
create trigger scores_plausible
  before insert on public.scores
  for each row execute function public.scores_plausible();

-- ---------------------------------------------------------------------
-- Feedback from any screen. UNR-197.
-- ---------------------------------------------------------------------

-- A report is a kind, an optional line, and what the game looked like
-- when it was sent. The page can add one and nothing else: no grant lets
-- the public key read a report back, so the page asks for return=minimal.
-- Read them in the Table Editor.
--
-- The kinds and the length limit are in the page too, and test.js fails
-- if the two differ. The context is whatever feedbackContext() in
-- index.html gathers; only its size is checked here.
--
-- Safe to run more than once.

create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind       text check (kind in ('bug', 'idea', 'fun')),
  message    text  not null default '' check (char_length(message) <= 500),
  context    jsonb not null default '{}'
             check (jsonb_typeof(context) = 'object' and octet_length(context::text) <= 4000),
  version    text  not null check (char_length(version) <= 20),
  -- A kind, or a line, or both: an empty report says nothing.
  constraint feedback_says_something
    check (kind is not null or char_length(btrim(message)) > 0)
);

alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;
grant insert (kind, message, context, version) on public.feedback to anon;

drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback
  for insert to anon with check (true);

-- Rate limited the same way as scores, with its own tally, so a burst of
-- reports can never use up anyone's chance to sign a score.
create table if not exists public.feedback_submissions (
  ip_hash text        not null,
  at      timestamptz not null default now()
);
create index if not exists feedback_submissions_at on public.feedback_submissions (at);

alter table public.feedback_submissions enable row level security;
revoke all on public.feedback_submissions from anon, authenticated;

create or replace function public.feedback_rate_limit() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- A player with something to say sends one or two. Five covers a
  -- string of bugs; the limit across everyone holds if IPs are made up.
  per_caller_limit constant int      := 5;
  everyone_limit   constant int      := 100;
  rate_window      constant interval := '10 minutes';

  headers json;
  caller  text;
begin
  headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  caller  := coalesce(headers->>'cf-connecting-ip',
                      split_part(headers->>'x-forwarded-for', ',', 1), '');
  caller  := encode(sha256(convert_to(caller, 'UTF8')), 'hex');

  delete from public.feedback_submissions where at < now() - rate_window;
  if (select count(*) from public.feedback_submissions) >= everyone_limit
     or (select count(*) from public.feedback_submissions where ip_hash = caller) >= per_caller_limit then
    raise exception using errcode = 'P0001', message = 'too much feedback, try again later';
  end if;
  insert into public.feedback_submissions (ip_hash) values (caller);

  return new;
end;
$$;

revoke all on function public.feedback_rate_limit() from public, anon, authenticated;

drop trigger if exists feedback_rate_limit on public.feedback;
create trigger feedback_rate_limit
  before insert on public.feedback
  for each row execute function public.feedback_rate_limit();
