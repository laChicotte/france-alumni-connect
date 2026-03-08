-- ================================================
-- TOUTES LES FONCTIONS - VERSION FINALE
-- France Alumni Guinée
-- ================================================

-- ================================================
-- 1. FONCTION DE SUPPRESSION COMPLÈTE D'UN USER
-- ================================================
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_id_to_delete uuid)
RETURNS void AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les admins peuvent supprimer des utilisateurs';
  END IF;

  -- Supprimer le profil alumni
  DELETE FROM public.alumni_profiles WHERE user_id = user_id_to_delete;

  -- Supprimer de la table users
  DELETE FROM public.users WHERE id = user_id_to_delete;

  -- Supprimer de auth.users (nécessite SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = user_id_to_delete;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les droits d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.delete_user_completely(uuid) TO authenticated;

-- ================================================
-- 2. FONCTION UPDATE_UPDATED_AT (pour tous les triggers)
-- ================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 3. FONCTION CHECK_EVENT_CAPACITY (inscriptions)
-- ================================================
CREATE OR REPLACE FUNCTION public.check_event_capacity()
RETURNS trigger AS $$
DECLARE
  v_places_max integer;
  v_current_count integer;
BEGIN
  SELECT e.places_max
  INTO v_places_max
  FROM public.evenements e
  WHERE e.id = NEW.evenement_id;

  -- Si places_max est NULL => inscriptions illimitées
  IF v_places_max IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(*)
  INTO v_current_count
  FROM public.inscriptions_evenements ie
  WHERE ie.evenement_id = NEW.evenement_id;

  IF v_current_count >= v_places_max THEN
    RAISE EXCEPTION 'Cet événement est complet';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
