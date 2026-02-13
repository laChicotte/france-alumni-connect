-- ================================================
-- TOUTES LES RLS POLICIES - VERSION FINALE
-- France Alumni Guinée
-- ================================================

-- ================================================
-- TABLE: users
-- ================================================

-- SELECT
DROP POLICY IF EXISTS "Users can view all active users" ON users;
CREATE POLICY "Users can view all active users"
ON users FOR SELECT
TO authenticated
USING (status = 'actif');

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- INSERT (pour l'auto-inscription)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- DELETE
DROP POLICY IF EXISTS "Admins can delete users" ON users;
CREATE POLICY "Admins can delete users"
ON users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ================================================
-- TABLE: alumni_profiles
-- ================================================

-- SELECT
DROP POLICY IF EXISTS "Alumni can view visible profiles" ON alumni_profiles;
CREATE POLICY "Alumni can view visible profiles"
ON alumni_profiles FOR SELECT
TO authenticated
USING (
  visible_annuaire = true
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = user_id AND u.status = 'actif'
  )
);

DROP POLICY IF EXISTS "Users can view own alumni profile" ON alumni_profiles;
CREATE POLICY "Users can view own alumni profile"
ON alumni_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT (pour l'auto-inscription)
DROP POLICY IF EXISTS "Users can insert own alumni profile" ON alumni_profiles;
CREATE POLICY "Users can insert own alumni profile"
ON alumni_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE
DROP POLICY IF EXISTS "Alumni can update own profile" ON alumni_profiles;
CREATE POLICY "Alumni can update own profile"
ON alumni_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all alumni profiles" ON alumni_profiles;
CREATE POLICY "Admins can update all alumni profiles"
ON alumni_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- DELETE
DROP POLICY IF EXISTS "Admins can delete alumni profiles" ON alumni_profiles;
CREATE POLICY "Admins can delete alumni profiles"
ON alumni_profiles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ================================================
-- TABLE: articles
-- ================================================

-- SELECT (public)
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
CREATE POLICY "Anyone can view published articles"
ON articles FOR SELECT
TO authenticated
USING (statut = 'publie');

-- INSERT
DROP POLICY IF EXISTS "Admins and moderators can create articles" ON articles;
CREATE POLICY "Admins and moderators can create articles"
ON articles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- UPDATE
DROP POLICY IF EXISTS "Admins and moderators can update articles" ON articles;
CREATE POLICY "Admins and moderators can update articles"
ON articles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- DELETE
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;
CREATE POLICY "Admins can delete articles"
ON articles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ================================================
-- TABLE: evenements
-- ================================================

-- SELECT
DROP POLICY IF EXISTS "Anyone can view published events" ON evenements;
CREATE POLICY "Anyone can view published events"
ON evenements FOR SELECT
TO authenticated
USING (statut = 'publie');

-- INSERT
DROP POLICY IF EXISTS "Admins and moderators can create events" ON evenements;
CREATE POLICY "Admins and moderators can create events"
ON evenements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- UPDATE
DROP POLICY IF EXISTS "Admins and moderators can update events" ON evenements;
CREATE POLICY "Admins and moderators can update events"
ON evenements FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- DELETE
DROP POLICY IF EXISTS "Admins can delete events" ON evenements;
CREATE POLICY "Admins can delete events"
ON evenements FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ================================================
-- TABLE: emplois
-- ================================================

-- SELECT
DROP POLICY IF EXISTS "Anyone can view published jobs" ON emplois;
CREATE POLICY "Anyone can view published jobs"
ON emplois FOR SELECT
TO authenticated
USING (statut = 'publie');

-- INSERT
DROP POLICY IF EXISTS "Admins and moderators can create jobs" ON emplois;
CREATE POLICY "Admins and moderators can create jobs"
ON emplois FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- UPDATE
DROP POLICY IF EXISTS "Admins and moderators can update jobs" ON emplois;
CREATE POLICY "Admins and moderators can update jobs"
ON emplois FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- DELETE
DROP POLICY IF EXISTS "Admins can delete jobs" ON emplois;
CREATE POLICY "Admins can delete jobs"
ON emplois FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ================================================
-- TABLE: partenaires
-- ================================================

-- SELECT (public)
DROP POLICY IF EXISTS "Anyone can view partners" ON partenaires;
CREATE POLICY "Anyone can view partners"
ON partenaires FOR SELECT
TO authenticated
USING (true);

-- INSERT
DROP POLICY IF EXISTS "Admins can create partners" ON partenaires;
CREATE POLICY "Admins can create partners"
ON partenaires FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- UPDATE
DROP POLICY IF EXISTS "Admins can update partners" ON partenaires;
CREATE POLICY "Admins can update partners"
ON partenaires FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- DELETE
DROP POLICY IF EXISTS "Admins can delete partners" ON partenaires;
CREATE POLICY "Admins can delete partners"
ON partenaires FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ================================================
-- TABLES DE RÉFÉRENCE: secteurs, statuts_professionnels
-- ================================================

-- SELECT (lecture publique)
DROP POLICY IF EXISTS "Anyone can view secteurs" ON secteurs;
CREATE POLICY "Anyone can view secteurs"
ON secteurs FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can view statuts_professionnels" ON statuts_professionnels;
CREATE POLICY "Anyone can view statuts_professionnels"
ON statuts_professionnels FOR SELECT
TO authenticated
USING (true);

-- INSERT/UPDATE/DELETE (admin seulement)
DROP POLICY IF EXISTS "Admins can manage secteurs" ON secteurs;
CREATE POLICY "Admins can manage secteurs"
ON secteurs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can manage statuts_professionnels" ON statuts_professionnels;
CREATE POLICY "Admins can manage statuts_professionnels"
ON statuts_professionnels FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ================================================
-- VÉRIFICATION
-- ================================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
