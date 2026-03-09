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

-- SELECT (contenu publié visible pour utilisateurs connectés)
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
DROP POLICY IF EXISTS "Published articles are readable" ON articles;
CREATE POLICY "Published articles are readable"
ON articles FOR SELECT
TO authenticated
USING (status = 'publie');

-- SELECT (gestion): admin voit tout, moderateur voit ses articles
DROP POLICY IF EXISTS "Admins and moderators can view manageable articles" ON articles;
CREATE POLICY "Admins and moderators can view manageable articles"
ON articles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND articles.auteur_id = auth.uid())
    )
  )
);

-- INSERT: admin peut créer pour tous, moderateur pour lui-même
DROP POLICY IF EXISTS "Admins and moderators can create articles" ON articles;
DROP POLICY IF EXISTS "Admins and moderators can insert articles" ON articles;
CREATE POLICY "Admins and moderators can insert articles"
ON articles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND articles.auteur_id = auth.uid())
    )
  )
);

-- UPDATE: admin tout, moderateur ses articles
DROP POLICY IF EXISTS "Admins and moderators can update articles" ON articles;
CREATE POLICY "Admins and moderators can update articles"
ON articles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND articles.auteur_id = auth.uid())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND articles.auteur_id = auth.uid())
    )
  )
);

-- DELETE: admin tout, moderateur ses articles
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;
DROP POLICY IF EXISTS "Admins and moderators can delete manageable articles" ON articles;
CREATE POLICY "Admins and moderators can delete manageable articles"
ON articles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND articles.auteur_id = auth.uid())
    )
  )
);

-- ================================================
-- TABLE: article_media
-- ================================================

-- SELECT (contenu publié)
DROP POLICY IF EXISTS "Published article media are readable" ON article_media;
CREATE POLICY "Published article media are readable"
ON article_media FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM articles a
    WHERE a.id = article_media.article_id
    AND a.status = 'publie'
  )
);

-- SELECT (gestion)
DROP POLICY IF EXISTS "Admins and moderators can view manageable article media" ON article_media;
CREATE POLICY "Admins and moderators can view manageable article media"
ON article_media FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM articles a
    JOIN users u ON u.id = auth.uid()
    WHERE a.id = article_media.article_id
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND a.auteur_id = auth.uid())
    )
  )
);

-- INSERT
DROP POLICY IF EXISTS "Admins and moderators can insert manageable article media" ON article_media;
CREATE POLICY "Admins and moderators can insert manageable article media"
ON article_media FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM articles a
    JOIN users u ON u.id = auth.uid()
    WHERE a.id = article_media.article_id
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND a.auteur_id = auth.uid())
    )
  )
);

-- UPDATE
DROP POLICY IF EXISTS "Admins and moderators can update manageable article media" ON article_media;
CREATE POLICY "Admins and moderators can update manageable article media"
ON article_media FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM articles a
    JOIN users u ON u.id = auth.uid()
    WHERE a.id = article_media.article_id
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND a.auteur_id = auth.uid())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM articles a
    JOIN users u ON u.id = auth.uid()
    WHERE a.id = article_media.article_id
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND a.auteur_id = auth.uid())
    )
  )
);

-- DELETE
DROP POLICY IF EXISTS "Admins and moderators can delete manageable article media" ON article_media;
CREATE POLICY "Admins and moderators can delete manageable article media"
ON article_media FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM articles a
    JOIN users u ON u.id = auth.uid()
    WHERE a.id = article_media.article_id
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND a.auteur_id = auth.uid())
    )
  )
);

-- ================================================
-- TABLE: evenements
-- ================================================

-- SELECT (visible côté app): événements ouverts
DROP POLICY IF EXISTS "Anyone can view published events" ON evenements;
DROP POLICY IF EXISTS "Visible events are readable" ON evenements;
CREATE POLICY "Visible events are readable"
ON evenements FOR SELECT
TO authenticated
USING (actif = true AND archive = false);

-- SELECT (gestion): admin tout, moderateur ses événements
DROP POLICY IF EXISTS "Admins and moderators can view manageable events" ON evenements;
CREATE POLICY "Admins and moderators can view manageable events"
ON evenements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND evenements.organisateur_id = auth.uid())
    )
  )
);

-- INSERT
DROP POLICY IF EXISTS "Admins and moderators can create events" ON evenements;
DROP POLICY IF EXISTS "Admins and moderators can insert events" ON evenements;
CREATE POLICY "Admins and moderators can insert events"
ON evenements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND evenements.organisateur_id = auth.uid())
    )
  )
);

-- UPDATE
DROP POLICY IF EXISTS "Admins and moderators can update events" ON evenements;
DROP POLICY IF EXISTS "Admins and moderators can update events (owned)" ON evenements;
CREATE POLICY "Admins and moderators can update events (owned)"
ON evenements FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND evenements.organisateur_id = auth.uid())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND evenements.organisateur_id = auth.uid())
    )
  )
);

-- DELETE
DROP POLICY IF EXISTS "Admins can delete events" ON evenements;
DROP POLICY IF EXISTS "Admins and moderators can delete manageable events" ON evenements;
CREATE POLICY "Admins and moderators can delete manageable events"
ON evenements FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'moderateur' AND evenements.organisateur_id = auth.uid())
    )
  )
);

-- ================================================
-- TABLE: inscriptions_evenements
-- ================================================

-- Contraintes/Indexes (anti doublon + perf)
CREATE UNIQUE INDEX IF NOT EXISTS uq_inscriptions_event_user
ON inscriptions_evenements (evenement_id, user_id);

CREATE INDEX IF NOT EXISTS idx_inscriptions_evenement_id
ON inscriptions_evenements (evenement_id);

CREATE INDEX IF NOT EXISTS idx_inscriptions_user_id
ON inscriptions_evenements (user_id);

-- UPDATE non autorisé
REVOKE UPDATE ON inscriptions_evenements FROM authenticated;

-- SELECT: utilisateur voit ses inscriptions
DROP POLICY IF EXISTS "Users can view own event registrations" ON inscriptions_evenements;
CREATE POLICY "Users can view own event registrations"
ON inscriptions_evenements FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- SELECT: admin/modérateur voient tout
DROP POLICY IF EXISTS "Admins and moderators can view all registrations" ON inscriptions_evenements;
CREATE POLICY "Admins and moderators can view all registrations"
ON inscriptions_evenements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- INSERT: inscription sur événement ouvert
DROP POLICY IF EXISTS "Authenticated users can register to visible events" ON inscriptions_evenements;
CREATE POLICY "Authenticated users can register to visible events"
ON inscriptions_evenements FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM evenements e
    WHERE e.id = inscriptions_evenements.evenement_id
    AND e.actif = true
    AND e.archive = false
  )
);

-- DELETE: utilisateur annule sa propre inscription
DROP POLICY IF EXISTS "Users can cancel own event registration" ON inscriptions_evenements;
CREATE POLICY "Users can cancel own event registration"
ON inscriptions_evenements FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- DELETE: admin/modérateur peuvent supprimer
DROP POLICY IF EXISTS "Admins and moderators can delete registrations" ON inscriptions_evenements;
CREATE POLICY "Admins and moderators can delete registrations"
ON inscriptions_evenements FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
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

-- INSERT (admin + moderateur: mêmes droits)
DROP POLICY IF EXISTS "Admins can create partners" ON partenaires;
DROP POLICY IF EXISTS "Admins and moderators can create partners" ON partenaires;
CREATE POLICY "Admins and moderators can create partners"
ON partenaires FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- UPDATE (admin + moderateur: mêmes droits)
DROP POLICY IF EXISTS "Admins can update partners" ON partenaires;
DROP POLICY IF EXISTS "Admins and moderators can update partners" ON partenaires;
CREATE POLICY "Admins and moderators can update partners"
ON partenaires FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
  )
);

-- DELETE (admin + moderateur: mêmes droits)
DROP POLICY IF EXISTS "Admins can delete partners" ON partenaires;
DROP POLICY IF EXISTS "Admins and moderators can delete partners" ON partenaires;
CREATE POLICY "Admins and moderators can delete partners"
ON partenaires FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'moderateur')
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
