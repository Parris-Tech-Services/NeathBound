-- NeathBound relational schema, modelled on Fallen London's split between
-- authored content (written by the CMS) and per-player state (written only by
-- the game API). Content is synced from /content by scripts/sync-content.mjs.

-- ---------------------------------------------------------------- content --
create table public.qualities (
  id          text primary key,
  name        text not null,
  category    text not null check (category in ('stat', 'currency', 'item', 'story')),
  description text not null default ''
);

create table public.areas (
  id         text primary key,
  name       text not null,
  subtitle   text not null default '',
  atmosphere text not null default '',
  sort       integer not null default 0
);

create table public.storylets (
  id           text primary key,
  area_id      text not null references public.areas (id),
  title        text not null,
  kicker       text not null default '',
  body         text not null,
  requirements jsonb not null default '[]'::jsonb,
  sort         integer not null default 0
);

create table public.branches (
  id           text primary key,
  storylet_id  text not null references public.storylets (id) on delete cascade,
  label        text not null,
  requirements jsonb not null default '[]'::jsonb,
  challenge    jsonb,
  success      jsonb not null,
  failure      jsonb,
  sort         integer not null default 0
);
create index branches_storylet_id_idx on public.branches (storylet_id);

-- Single-row world settings (starting area, qualities, journal).
create table public.world (
  id       boolean primary key default true check (id),
  settings jsonb not null
);

-- ----------------------------------------------------------- player state --
create table public.characters (
  user_id              uuid primary key references auth.users (id) on delete cascade,
  name                 text not null,
  area_id              text not null references public.areas (id),
  current_storylet_id  text references public.storylets (id) on delete set null,
  journal              jsonb not null default '[]'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- The sparse quality map: one row per quality the character has (level > 0).
create table public.character_qualities (
  user_id    uuid not null references public.characters (user_id) on delete cascade,
  quality_id text not null references public.qualities (id),
  level      integer not null check (level > 0),
  primary key (user_id, quality_id)
);

-- --------------------------------------------------------------- security --
alter table public.qualities           enable row level security;
alter table public.areas               enable row level security;
alter table public.storylets           enable row level security;
alter table public.branches            enable row level security;
alter table public.world               enable row level security;
alter table public.characters          enable row level security;
alter table public.character_qualities enable row level security;

-- Content is public to read; only the service role (CMS sync) writes it.
create policy "content is readable" on public.qualities for select to anon, authenticated using (true);
create policy "content is readable" on public.areas     for select to anon, authenticated using (true);
create policy "content is readable" on public.storylets for select to anon, authenticated using (true);
create policy "content is readable" on public.branches  for select to anon, authenticated using (true);
create policy "content is readable" on public.world     for select to anon, authenticated using (true);

-- Players may read only their own state. There are deliberately no insert,
-- update or delete policies: all writes go through the `api` Edge Function
-- (service role), which makes the server authoritative, as in Fallen London.
create policy "read own character" on public.characters
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own qualities" on public.character_qualities
  for select to authenticated using ((select auth.uid()) = user_id);
