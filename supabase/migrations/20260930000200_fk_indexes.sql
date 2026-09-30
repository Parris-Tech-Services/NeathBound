-- Covering indexes for foreign keys (Supabase performance advisor 0001).
create index character_qualities_quality_id_idx on public.character_qualities (quality_id);
create index characters_area_id_idx on public.characters (area_id);
create index characters_current_storylet_id_idx on public.characters (current_storylet_id);
create index storylets_area_id_idx on public.storylets (area_id);
