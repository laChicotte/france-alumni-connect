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
