-- Persist every part of the game state that has no relational table of its
-- own (momentum, revision, hand, discard, events, globalFlags, progress, and
-- any field added later) in players.extra. Before this, those fields were
-- silently dropped for online players on every save.
alter table public.players add column if not exists extra jsonb not null default '{}'::jsonb;

create or replace function public.save_player(p_user_id uuid, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  relational_keys text[] := array['name','locationId','echoes','lastDraw','qualities','menaces','items',
                                  'flags','unlockedLocations','acquaintances','journal'];
begin
  insert into public.players (user_id, display_name, location_id, echoes, last_draw, extra, updated_at)
  values (
    p_user_id,
    coalesce(p_state->>'name', 'The Unmoored'),
    p_state->>'locationId',
    greatest(0, coalesce((p_state->>'echoes')::integer, 0)),
    p_state->>'lastDraw',
    p_state - relational_keys,
    now()
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    location_id  = excluded.location_id,
    echoes       = excluded.echoes,
    last_draw    = excluded.last_draw,
    extra        = excluded.extra,
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
  where ordinality <= 100;
end;
$$;

revoke all on function public.save_player(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_player(uuid, jsonb) to service_role;

create or replace function public.load_player(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when p.user_id is null then null else p.extra || jsonb_build_object(
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
