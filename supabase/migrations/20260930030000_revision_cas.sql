-- Add optimistic concurrency to authoritative player saves.
alter table public.players
  add column if not exists revision bigint not null default 0;

update public.players p
set revision = coalesce((
  select case
    when jsonb_typeof(f.value) = 'number' then (f.value #>> '{}')::bigint
    else 0
  end
  from public.player_flags f
  where f.user_id = p.user_id and f.flag_id = '__revision'
), 0);

-- Keep the original whole-state writer as the implementation detail.
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'save_player'
      and pg_get_function_identity_arguments(p.oid) = 'p_user_id uuid, p_state jsonb'
  ) and not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'save_player_unchecked'
  ) then
    alter function public.save_player(uuid, jsonb) rename to save_player_unchecked;
  end if;
end $$;

create or replace function public.save_player(p_user_id uuid, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.save_player_unchecked(p_user_id, p_state);
  update public.players
  set revision = greatest(0, coalesce((p_state->>'revision')::bigint, 0))
  where user_id = p_user_id;
end;
$$;

revoke all on function public.save_player(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_player(uuid, jsonb) to service_role;

create or replace function public.save_player_if_revision(
  p_user_id uuid,
  p_state jsonb,
  p_expected_revision bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_revision bigint;
begin
  select revision
  into current_revision
  from public.players
  where user_id = p_user_id
  for update;

  if current_revision is null or current_revision <> p_expected_revision then
    return false;
  end if;

  perform public.save_player(p_user_id, p_state);
  return true;
end;
$$;

revoke all on function public.save_player_if_revision(uuid, jsonb, bigint) from public, anon, authenticated;
grant execute on function public.save_player_if_revision(uuid, jsonb, bigint) to service_role;
