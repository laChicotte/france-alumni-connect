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
-- 3. CRÉER LE BUCKET "alumni-photos"
-- ================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'alumni-photos',
  'alumni-photos',
  true,  -- Public pour affichage direct dans l'annuaire/menu/profil
  3145728,  -- 3MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 4. POLICIES POUR LE BUCKET "alumni-photos"
-- ================================================

-- SELECT: lecture publique des photos
DROP POLICY IF EXISTS "Anyone can view alumni photos" ON storage.objects;
CREATE POLICY "Anyone can view alumni photos"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'alumni-photos'
);

-- INSERT: utilisateur connecté peut uploader dans son dossier
DROP POLICY IF EXISTS "Users can upload own alumni photo" ON storage.objects;
CREATE POLICY "Users can upload own alumni photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'alumni-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: utilisateur connecté peut modifier ses photos
DROP POLICY IF EXISTS "Users can update own alumni photo" ON storage.objects;
CREATE POLICY "Users can update own alumni photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'alumni-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: utilisateur connecté peut supprimer ses photos
DROP POLICY IF EXISTS "Users can delete own alumni photo" ON storage.objects;
CREATE POLICY "Users can delete own alumni photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'alumni-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================
-- 5. CRÉER LE BUCKET "articles-media"
-- ================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'articles-media',
  'articles-media',
  true,  -- Public pour affichage des couvertures + médias d'articles
  10485760,  -- 10MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 6. POLICIES POUR LE BUCKET "articles-media"
-- ================================================

-- SELECT: lecture publique des médias d'articles
DROP POLICY IF EXISTS "Anyone can view article media" ON storage.objects;
CREATE POLICY "Anyone can view article media"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'articles-media'
);

-- INSERT: utilisateur authentifié peut uploader dans son dossier
DROP POLICY IF EXISTS "Users can upload own article media" ON storage.objects;
CREATE POLICY "Users can upload own article media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'articles-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: utilisateur authentifié peut modifier ses fichiers
DROP POLICY IF EXISTS "Users can update own article media" ON storage.objects;
CREATE POLICY "Users can update own article media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'articles-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: propriétaire ou admin
DROP POLICY IF EXISTS "Users can delete own article media or admin" ON storage.objects;
CREATE POLICY "Users can delete own article media or admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'articles-media'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  )
);

-- ================================================
-- 7. CRÉER LE BUCKET "evenements-media"
-- ================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evenements-media',
  'evenements-media',
  true,  -- Public pour affichage direct des images événements
  5242880,  -- 5MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 8. POLICIES POUR LE BUCKET "evenements-media"
-- ================================================

-- SELECT: lecture publique des médias événements
DROP POLICY IF EXISTS "Anyone can view evenements media" ON storage.objects;
CREATE POLICY "Anyone can view evenements media"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'evenements-media'
);

-- INSERT: utilisateur authentifié peut uploader dans son dossier
DROP POLICY IF EXISTS "Users can upload own evenements media" ON storage.objects;
CREATE POLICY "Users can upload own evenements media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evenements-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: utilisateur authentifié peut modifier ses fichiers
DROP POLICY IF EXISTS "Users can update own evenements media" ON storage.objects;
CREATE POLICY "Users can update own evenements media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'evenements-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: propriétaire ou admin
DROP POLICY IF EXISTS "Users can delete own evenements media or admin" ON storage.objects;
CREATE POLICY "Users can delete own evenements media or admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evenements-media'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  )
);

-- ================================================
-- 9. CRÉER LE BUCKET "logo-partenaire"
-- ================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logo-partenaire',
  'logo-partenaire',
  true,  -- Public pour affichage direct dans la section partenaires
  3145728,  -- 3MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 10. POLICIES POUR LE BUCKET "logo-partenaire"
-- ================================================

-- SELECT: lecture publique des logos partenaires
DROP POLICY IF EXISTS "Anyone can view partenaires logos" ON storage.objects;
CREATE POLICY "Anyone can view partenaires logos"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'logo-partenaire'
);

-- INSERT: admin et modérateur (mêmes droits)
DROP POLICY IF EXISTS "Admins and moderators can upload partenaires logos" ON storage.objects;
CREATE POLICY "Admins and moderators can upload partenaires logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logo-partenaire'
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- UPDATE: admin et modérateur (mêmes droits)
DROP POLICY IF EXISTS "Admins and moderators can update partenaires logos" ON storage.objects;
CREATE POLICY "Admins and moderators can update partenaires logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logo-partenaire'
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- DELETE: admin et modérateur (mêmes droits)
DROP POLICY IF EXISTS "Admins and moderators can delete partenaires logos" ON storage.objects;
CREATE POLICY "Admins and moderators can delete partenaires logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logo-partenaire'
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
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
WHERE bucket_id IN ('diplomes', 'alumni-photos', 'articles-media', 'evenements-media', 'logo-partenaire')
ORDER BY name;
