-- NeathBound player persistence on Supabase Postgres (replaces the Cloudflare
-- D1 schema in the former migrations/ folder). Narrative content ships with
-- the `api` function from src/game/content.js; the database holds players and
-- world qualities. Mirrors the D1 tables and also persists menaces, unlocked
-- locations, acquaintances and the last card drawn, which D1 did not store.

create table public.players (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  location_id  text not null,
  echoes       integer not null default 0 check (echoes >= 0),
  last_draw    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.player_qualities (
  user_id    uuid not null references public.players (user_id) on delete cascade,
  quality_id text not null,
  value      numeric not null default 0,
  primary key (user_id, quality_id)
);

create table public.player_menaces (
  user_id   uuid not null references public.players (user_id) on delete cascade,
  menace_id text not null,
  value     numeric not null default 0,
  primary key (user_id, menace_id)
);

create table public.player_items (
  user_id  uuid not null references public.players (user_id) on delete cascade,
  item_id  text not null,
  quantity integer not null check (quantity > 0),
  primary key (user_id, item_id)
);

create table public.player_flags (
  user_id uuid not null references public.players (user_id) on delete cascade,
  flag_id text not null,
  value   jsonb not null,
  primary key (user_id, flag_id)
);

create table public.player_locations (
  user_id     uuid not null references public.players (user_id) on delete cascade,
  location_id text not null,
  primary key (user_id, location_id)
);

create table public.player_acquaintances (
  user_id         uuid not null references public.players (user_id) on delete cascade,
  acquaintance_id text not null,
  primary key (user_id, acquaintance_id)
);

create table public.journal_entries (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.players (user_id) on delete cascade,
  position   integer not null,
  text       text not null,
  created_at timestamptz not null default now()
);
create index journal_entries_user_position_idx on public.journal_entries (user_id, position);

-- Shared world state (for future world events); readable by everyone.
create table public.world_qualities (
  id    text primary key,
  value numeric not null default 0
);

alter table public.players              enable row level security;
alter table public.player_qualities     enable row level security;
alter table public.player_menaces       enable row level security;
alter table public.player_items         enable row level security;
alter table public.player_flags         enable row level security;
alter table public.player_locations     enable row level security;
alter table public.player_acquaintances enable row level security;
alter table public.journal_entries      enable row level security;
alter table public.world_qualities      enable row level security;

-- Players can read only their own rows. There are no write policies: all
-- writes go through the `api` function (service role), so the server is
-- authoritative and players cannot edit their own state.
create policy "read own player" on public.players for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own qualities" on public.player_qualities for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own menaces" on public.player_menaces for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own items" on public.player_items for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own flags" on public.player_flags for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own locations" on public.player_locations for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own acquaintances" on public.player_acquaintances for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own journal" on public.journal_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "world is readable" on public.world_qualities for select to anon, authenticated using (true);

-- Atomically replace a player's whole state. Only the service role may call it.
create or replace function public.save_player(p_user_id uuid, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.players (user_id, display_name, location_id, echoes, last_draw, updated_at)
  values (
    p_user_id,
    coalesce(p_state->>'name', 'The Unmoored'),
    p_state->>'locationId',
    greatest(0, coalesce((p_state->>'echoes')::integer, 0)),
    p_state->>'lastDraw',
    now()
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    location_id  = excluded.location_id,
    echoes       = excluded.echoes,
    last_draw    = excluded.last_draw,
    updated_at   = now();

  delete from public.player_qualities where user_id = p_user_id;
  insert into public.player_qualities (user_id, quality_id, value)
  select p_user_id, key, value::numeric from jsonb_each_text(coalesce(p_state->'qualities', '{}'::jsonb));

  delete from public.player_menaces where user_id = p_user_id;
  insert into public.player_menaces (user_id, menace_id, value)
  select p_user_id, key, value::numeric from jsonb_each_text(coalesce(p_state->'menaces', '{}'::jsonb));

  delete from public.player_items where user_id = p_user_id;
  insert into public.player_items (user_id, item_id, quantity)
  select p_user_id, key, value::integer from jsonb_each_text(coalesce(p_state->'items', '{}'::jsonb))
  where value::integer > 0;

  delete from public.player_flags where user_id = p_user_id;
  insert into public.player_flags (user_id, flag_id, value)
  select p_user_id, key, value from jsonb_each(coalesce(p_state->'flags', '{}'::jsonb));

  delete from public.player_locations where user_id = p_user_id;
  insert into public.player_locations (user_id, location_id)
  select distinct p_user_id, loc from jsonb_array_elements_text(coalesce(p_state->'unlockedLocations', '[]'::jsonb)) loc;

  delete from public.player_acquaintances where user_id = p_user_id;
  insert into public.player_acquaintances (user_id, acquaintance_id)
  select distinct p_user_id, a from jsonb_array_elements_text(coalesce(p_state->'acquaintances', '[]'::jsonb)) a;

  delete from public.journal_entries where user_id = p_user_id;
  insert into public.journal_entries (user_id, position, text)
  select p_user_id, (ordinality - 1)::integer, entry
  from jsonb_array_elements_text(coalesce(p_state->'journal', '[]'::jsonb)) with ordinality as j(entry, ordinality)
  where ordinality <= 30;
end;
$$;

revoke all on function public.save_player(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_player(uuid, jsonb) to service_role;

-- Read a player's whole state as one JSON document (service role only).
create or replace function public.load_player(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when p.user_id is null then null else jsonb_build_object(
    'version', 2,
    'name', p.display_name,
    'locationId', p.location_id,
    'echoes', p.echoes,
    'lastDraw', p.last_draw,
    'qualities', coalesce((select jsonb_object_agg(quality_id, value) from public.player_qualities where user_id = p.user_id), '{}'::jsonb),
    'menaces', coalesce((select jsonb_object_agg(menace_id, value) from public.player_menaces where user_id = p.user_id), '{}'::jsonb),
    'items', coalesce((select jsonb_object_agg(item_id, quantity) from public.player_items where user_id = p.user_id), '{}'::jsonb),
    'flags', coalesce((select jsonb_object_agg(flag_id, value) from public.player_flags where user_id = p.user_id), '{}'::jsonb),
    'unlockedLocations', coalesce((select jsonb_agg(location_id order by location_id) from public.player_locations where user_id = p.user_id), '[]'::jsonb),
    'acquaintances', coalesce((select jsonb_agg(acquaintance_id order by acquaintance_id) from public.player_acquaintances where user_id = p.user_id), '[]'::jsonb),
    'journal', coalesce((select jsonb_agg(text order by position) from public.journal_entries where user_id = p.user_id), '[]'::jsonb)
  ) end
  from (select p_user_id as uid) x
  left join public.players p on p.user_id = x.uid;
$$;

revoke all on function public.load_player(uuid) from public, anon, authenticated;
grant execute on function public.load_player(uuid) to service_role;

-- Retire the earlier content-in-database schema: content now ships with the
-- function from src/game/content.js, so one source of truth remains.
drop function if exists public.save_character(uuid, jsonb);
drop table if exists public.character_qualities, public.characters, public.branches,
  public.storylets, public.areas, public.qualities, public.world;
