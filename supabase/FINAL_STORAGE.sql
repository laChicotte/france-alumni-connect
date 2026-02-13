-- ================================================
-- CONFIGURATION STORAGE - VERSION FINALE
-- France Alumni Guinée
-- ================================================

-- ================================================
-- 1. CRÉER LE BUCKET "diplomes"
-- ================================================
-- À faire dans l'interface Supabase Storage ou via SQL:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diplomes',
  'diplomes',
  false,  -- Pas public, accès contrôlé par policies
  5242880,  -- 5MB max
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 2. POLICIES POUR LE BUCKET "diplomes"
-- ================================================

-- SELECT: Seuls les admins et le propriétaire peuvent voir les diplômes
DROP POLICY IF EXISTS "Users can view own diploma" ON storage.objects;
CREATE POLICY "Users can view own diploma"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'diplomes'
  AND (
    -- L'utilisateur peut voir son propre diplôme
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Les admins peuvent voir tous les diplômes
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  )
);

-- INSERT: Les utilisateurs peuvent uploader leur diplôme
DROP POLICY IF EXISTS "Users can upload own diploma" ON storage.objects;
CREATE POLICY "Users can upload own diploma"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'diplomes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: Les utilisateurs peuvent mettre à jour leur diplôme
DROP POLICY IF EXISTS "Users can update own diploma" ON storage.objects;
CREATE POLICY "Users can update own diploma"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'diplomes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Seuls les admins peuvent supprimer des diplômes
DROP POLICY IF EXISTS "Admins can delete diplomas" ON storage.objects;
CREATE POLICY "Admins can delete diplomas"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'diplomes'
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ================================================
-- VÉRIFICATION
-- ================================================
SELECT
  bucket_id,
  name as policy_name,
  definition
FROM storage.policies
WHERE bucket_id = 'diplomes'
ORDER BY name;
