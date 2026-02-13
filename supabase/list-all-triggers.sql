-- ================================================
-- LISTE DE TOUS LES TRIGGERS - Supabase
-- Exécuter dans SQL Editor et sauvegarder le résultat
-- ================================================

-- Vue complète de tous les triggers
SELECT
  n.nspname as schema,
  c.relname as table_name,
  t.tgname as trigger_name,
  CASE t.tgtype::integer & 1
    WHEN 1 THEN 'ROW'
    ELSE 'STATEMENT'
  END as level,
  CASE t.tgtype::integer & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing,
  CASE
    WHEN t.tgtype::integer & 4 <> 0 THEN 'INSERT'
    WHEN t.tgtype::integer & 8 <> 0 THEN 'DELETE'
    WHEN t.tgtype::integer & 16 <> 0 THEN 'UPDATE'
    WHEN t.tgtype::integer & 32 <> 0 THEN 'TRUNCATE'
    ELSE 'UNKNOWN'
  END as event,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
ORDER BY n.nspname, c.relname, t.tgname;

-- Version simplifiée (plus lisible)
SELECT
  trigger_schema,
  trigger_name,
  event_object_table as table_name,
  event_manipulation as event,
  action_timing as timing,
  action_statement as action
FROM information_schema.triggers
ORDER BY trigger_schema, event_object_table, trigger_name;
