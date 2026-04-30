-- ================================================
-- SCHÉMA COMPLET - VERSION FINALE
-- France Alumni Guinée
-- ================================================
-- À exécuter EN PREMIER (étape 0) avant tous les autres FINAL_*.sql
-- Conçu pour une base vierge. Idempotent (IF NOT EXISTS partout).

-- ================================================
-- TYPES ENUM
-- ================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'moderateur', 'alumni');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('en_attente', 'actif', 'banni');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 15 valeurs officielles du diplôme
DO $$ BEGIN
  CREATE TYPE diplome_type AS ENUM (
    'bts', 'dut', 'du', 'de', 'deug', 'prepa',
    'ecole_ingenieur', 'ecole_specialisee',
    'licence_pro', 'licence',
    'master1', 'master2',
    'doctorat', 'post_doctorat',
    'autre'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE genre_type AS ENUM ('Homme', 'Femme', 'Autre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE nationalite_type AS ENUM ('Guinéenne', 'Franco-Guinéenne', 'Guinéenne-Autre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE article_status AS ENUM ('brouillon', 'publie', 'en_attente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE article_media_type AS ENUM ('image', 'video');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('cdi', 'cdd', 'stage', 'freelance', 'alternance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ================================================
-- TABLES DE RÉFÉRENCE (sans dépendances FK)
-- ================================================

CREATE TABLE IF NOT EXISTS public.secteurs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle     TEXT        NOT NULL,
  ordre       INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.secteurs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.statuts_professionnels (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle     TEXT        NOT NULL,
  ordre       INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.statuts_professionnels ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.categories_articles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle     TEXT        NOT NULL,
  ordre       INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.categories_articles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.types_evenements (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle     TEXT        NOT NULL,
  ordre       INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.types_evenements ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.partenaires (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         TEXT        NOT NULL,
  logo_url    TEXT        NOT NULL,
  site_web    TEXT,
  description TEXT,
  ordre       INTEGER     NOT NULL DEFAULT 0,
  actif       BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.partenaires ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: users
-- ================================================

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  nom         TEXT,
  prenom      TEXT,
  photo_url   TEXT,
  role        user_role   NOT NULL DEFAULT 'alumni',
  status      user_status NOT NULL DEFAULT 'en_attente',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: alumni_profiles
-- ================================================

CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id                       UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID             NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nom                      TEXT             NOT NULL,
  prenom                   TEXT             NOT NULL,
  genre                    genre_type       NOT NULL DEFAULT 'Autre',
  nationalite              nationalite_type NOT NULL DEFAULT 'Guinéenne',
  photo_url                TEXT,
  telephone                TEXT             NOT NULL,
  ville                    TEXT             NOT NULL,
  universite               TEXT             NOT NULL,
  annee_promotion          INTEGER          NOT NULL,
  diplome                  diplome_type     NOT NULL,
  formation_domaine        TEXT             NOT NULL,
  statut_professionnel_id  UUID             REFERENCES public.statuts_professionnels(id),
  secteur_id               UUID             REFERENCES public.secteurs(id),
  entreprise               TEXT,
  poste_actuel             TEXT,
  bio                      TEXT,
  linkedin_url             TEXT,
  visible_annuaire         BOOLEAN          NOT NULL DEFAULT true,
  document_diplome_url     TEXT,
  plan_retour              TEXT,
  bourse                   TEXT             CHECK (bourse IN (
                             'Non boursier',
                             'Boursier Etat français',
                             'Boursier Etat guinéen',
                             'Boursier Etats français et guinéen'
                           )),
  created_at               TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: articles
-- ================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id                    UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  titre                 TEXT           NOT NULL,
  slug                  TEXT           NOT NULL UNIQUE,
  extrait               TEXT,
  contenu               TEXT           NOT NULL,
  image_couverture_url  TEXT           NOT NULL,
  categorie_id          UUID           REFERENCES public.categories_articles(id),
  auteur_id             UUID           REFERENCES public.users(id),
  auteur_nom            TEXT,                          -- Nom d'auteur libre (optionnel, prioritaire sur auteur_id)
  status                article_status NOT NULL DEFAULT 'brouillon',
  date_publication      TIMESTAMPTZ,
  vues                  INTEGER        NOT NULL DEFAULT 0,
  epingle               BOOLEAN        NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: article_media
-- ================================================

CREATE TABLE IF NOT EXISTS public.article_media (
  id          UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  UUID               NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  media_type  article_media_type NOT NULL,
  media_url   TEXT               NOT NULL,
  ordre       INTEGER            NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);
ALTER TABLE public.article_media ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: emplois
-- ================================================

CREATE TABLE IF NOT EXISTS public.emplois (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre            TEXT        NOT NULL,
  entreprise       TEXT        NOT NULL,
  localisation     TEXT        NOT NULL,
  type_contrat     job_type    NOT NULL,
  secteur_id       UUID        REFERENCES public.secteurs(id),
  description      TEXT        NOT NULL,
  profil_recherche TEXT,
  teletravail      BOOLEAN     NOT NULL DEFAULT false,
  email_contact    TEXT        NOT NULL,
  lien_postuler    TEXT,
  fichier_url      TEXT,
  date_expiration  DATE,
  actif            BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.emplois ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: evenements
-- ================================================

CREATE TABLE IF NOT EXISTS public.evenements (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre              TEXT        NOT NULL,
  slug               TEXT        NOT NULL,
  date               DATE        NOT NULL,
  heure              TEXT        NOT NULL,
  lieu               TEXT        NOT NULL,
  type_evenement_id  UUID        REFERENCES public.types_evenements(id),
  description        TEXT        NOT NULL,
  image_url          TEXT        NOT NULL,
  places_max         INTEGER,
  lien_visio         TEXT,
  organisateur_id    UUID        REFERENCES public.users(id),
  archive            BOOLEAN     NOT NULL DEFAULT false,
  actif              BOOLEAN     NOT NULL DEFAULT true,
  statut             TEXT        NOT NULL DEFAULT 'publie'
                     CHECK (statut IN ('en_attente', 'publie', 'rejete')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.evenements ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: inscriptions_evenements
-- ================================================

CREATE TABLE IF NOT EXISTS public.inscriptions_evenements (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evenement_id          UUID        NOT NULL REFERENCES public.evenements(id) ON DELETE CASCADE,
  user_id               UUID        REFERENCES public.users(id),
  nom_externe           TEXT,
  prenom_externe        TEXT,
  email_externe         TEXT,
  telephone_externe     TEXT,
  organisation_externe  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.inscriptions_evenements ENABLE ROW LEVEL SECURITY;

-- Anti-doublon : un utilisateur connecté ne peut s'inscrire qu'une fois
CREATE UNIQUE INDEX IF NOT EXISTS uq_inscriptions_event_user
  ON public.inscriptions_evenements (evenement_id, user_id);

CREATE INDEX IF NOT EXISTS idx_inscriptions_evenement_id
  ON public.inscriptions_evenements (evenement_id);

CREATE INDEX IF NOT EXISTS idx_inscriptions_user_id
  ON public.inscriptions_evenements (user_id);

-- ================================================
-- TABLE: types_formations
-- ================================================

CREATE TABLE IF NOT EXISTS public.types_formations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle     TEXT        NOT NULL,
  ordre       INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.types_formations ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: formations
-- ================================================

CREATE TABLE IF NOT EXISTS public.formations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre             TEXT        NOT NULL,
  slug              TEXT        NOT NULL UNIQUE,
  date_debut        DATE        NOT NULL,
  date_fin          DATE,
  heure_debut       TEXT        NOT NULL,
  heure_fin         TEXT,
  lieu              TEXT        NOT NULL,
  lien_visio        TEXT,
  type_formation_id UUID        REFERENCES public.types_formations(id),
  description       TEXT        NOT NULL,
  programme         TEXT,
  image_url         TEXT        NOT NULL DEFAULT '',
  places_max        INTEGER,
  niveau            TEXT        CHECK (niveau IN ('Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux')),
  gratuit           BOOLEAN     NOT NULL DEFAULT true,
  prix              NUMERIC(10,2),
  proposee_par      UUID        REFERENCES public.users(id),
  statut            TEXT        NOT NULL DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente', 'publiee', 'archivee')),
  actif             BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: inscriptions_formations
-- ================================================

CREATE TABLE IF NOT EXISTS public.inscriptions_formations (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id          UUID        NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  user_id               UUID        REFERENCES public.users(id),
  nom_externe           TEXT,
  prenom_externe        TEXT,
  email_externe         TEXT,
  telephone_externe     TEXT,
  organisation_externe  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.inscriptions_formations ENABLE ROW LEVEL SECURITY;

-- Anti-doublon : un utilisateur connecté ne peut s'inscrire qu'une fois par formation
CREATE UNIQUE INDEX IF NOT EXISTS uq_inscriptions_formation_user
  ON public.inscriptions_formations (formation_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inscriptions_formation_id
  ON public.inscriptions_formations (formation_id);

CREATE INDEX IF NOT EXISTS idx_inscriptions_formation_user_id
  ON public.inscriptions_formations (user_id);

-- ================================================
-- TABLE: mentor_demandes
-- ================================================

CREATE TABLE IF NOT EXISTS public.mentor_demandes (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  aides_proposees   TEXT[]      NOT NULL DEFAULT '{}',
  max_personnes     INTEGER     NOT NULL CHECK (max_personnes >= 1),
  canaux_echange    TEXT[]      NOT NULL DEFAULT '{}',
  disponibilites    TEXT[]      NOT NULL DEFAULT '{}',
  statut            TEXT        NOT NULL DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente', 'approuve', 'refuse')),
  note_admin        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_mentor_demande_per_user UNIQUE (user_id)
);
ALTER TABLE public.mentor_demandes ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TABLE: entreprises_alumni
-- ================================================

CREATE TABLE IF NOT EXISTS public.entreprises_alumni (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  statut        TEXT        NOT NULL DEFAULT 'en_attente'
                            CHECK (statut IN ('en_attente', 'valide', 'rejete')),

  -- Étape 1: Identification
  fonction                  TEXT        NOT NULL,
  email_pro                 TEXT        NOT NULL,
  telephone_pro             TEXT        NOT NULL,

  -- Étape 2: Juridique (confidentiel → filtré côté API)
  denomination_sociale      TEXT        NOT NULL,
  nom_commercial            TEXT,
  forme_juridique           TEXT        NOT NULL,
  date_creation             DATE        NOT NULL,
  numero_rccm_nif           TEXT        NOT NULL,
  localisation_siege        TEXT        NOT NULL,
  document_justificatif_url TEXT,

  -- Étape 3: Profil entreprise
  secteur_activite          TEXT        NOT NULL,
  description_produits      TEXT        NOT NULL,
  stade_developpement       TEXT        NOT NULL
                            CHECK (stade_developpement IN ('lancement', 'activite_reguliere', 'croissance', 'expansion')),
  effectif                  TEXT        NOT NULL,
  chiffre_affaires          TEXT,
  types_clients             TEXT[]      NOT NULL DEFAULT '{}',
  site_web                  TEXT,

  -- Étape 4: Besoins (confidentiel → filtré côté API)
  besoins                   TEXT[]      NOT NULL DEFAULT '{}',
  besoins_autre             TEXT,

  -- Étape 5: Collaboration (confidentiel → filtré côté API)
  recherche_associe         BOOLEAN     NOT NULL DEFAULT false,
  domaine_associe           TEXT,
  propose_emploi            BOOLEAN     NOT NULL DEFAULT false,
  disponible_evenement      BOOLEAN     NOT NULL DEFAULT false,
  souhaite_mentor           BOOLEAN     NOT NULL DEFAULT false,

  -- Étape 6: Impact & Valorisation
  impact_principal          TEXT[]      NOT NULL DEFAULT '{}',
  description_impact        TEXT,
  mise_en_avant             BOOLEAN     NOT NULL DEFAULT false,
  presentation_publication  TEXT,
  logo_url                  TEXT,
  photos_urls               TEXT[]      NOT NULL DEFAULT '{}',

  -- Admin
  notes_admin               TEXT,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.entreprises_alumni ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_entreprises_alumni_user_id
  ON public.entreprises_alumni (user_id);

CREATE INDEX IF NOT EXISTS idx_entreprises_alumni_statut
  ON public.entreprises_alumni (statut);

-- ================================================
-- VÉRIFICATION
-- ================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
