-- Atomically replace a character's state (row + sparse quality map).
-- Only the `api` Edge Function (service role) may call it.
create or replace function public.save_character(p_user_id uuid, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.characters (user_id, name, area_id, current_storylet_id, journal, updated_at)
  values (
    p_user_id,
    p_state->>'name',
    p_state->>'areaId',
    nullif(p_state->>'currentStoryletId', ''),
    coalesce(p_state->'journal', '[]'::jsonb),
    now()
  )
  on conflict (user_id) do update set
    name = excluded.name,
    area_id = excluded.area_id,
    current_storylet_id = excluded.current_storylet_id,
    journal = excluded.journal,
    updated_at = now();

  delete from public.character_qualities where user_id = p_user_id;
  insert into public.character_qualities (user_id, quality_id, level)
  select p_user_id, q.key, (q.value)::integer
  from jsonb_each_text(coalesce(p_state->'qualities', '{}'::jsonb)) as q
  where (q.value)::integer > 0;
end;
$$;

revoke all on function public.save_character(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_character(uuid, jsonb) to service_role;
