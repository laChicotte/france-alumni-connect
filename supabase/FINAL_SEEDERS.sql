-- ================================================
-- DONNÉES DE SEED - VERSION FINALE
-- France Alumni Guinée
-- ================================================

-- Vider les tables d'abord
TRUNCATE TABLE secteurs CASCADE;
TRUNCATE TABLE statuts_professionnels CASCADE;

-- ================================================
-- SECTEURS D'ACTIVITÉ
-- ================================================
INSERT INTO secteurs (libelle, ordre) VALUES
  ('Agriculture / Agroalimentaire', 1),
  ('Banque / Finance / Assurance', 2),
  ('BTP / Construction / Immobilier', 3),
  ('Commerce / Distribution / Vente', 4),
  ('Communication / Marketing / Publicité', 5),
  ('Conseil / Audit / Expertise', 6),
  ('Droit / Justice', 7),
  ('Éducation / Formation / Recherche', 8),
  ('Énergie / Environnement', 9),
  ('Fonction publique / Administration', 10),
  ('Hôtellerie / Restauration / Tourisme', 11),
  ('Industrie / Production', 12),
  ('Informatique / Télécoms / Digital', 13),
  ('Médias / Arts / Culture', 14),
  ('ONG / Humanitaire / Développement', 15),
  ('Santé / Médical / Pharmaceutique', 16),
  ('Transport / Logistique', 17),
  ('Autre', 18);

-- ================================================
-- STATUTS PROFESSIONNELS
-- ================================================
INSERT INTO statuts_professionnels (libelle, ordre) VALUES
  ('Étudiant', 1),
  ('En recherche d''emploi', 2),
  ('Salarié', 3),
  ('Fonctionnaire', 4),
  ('Entrepreneur / Chef d''entreprise', 5),
  ('Freelance / Indépendant', 6),
  ('Consultant', 7),
  ('Cadre dirigeant', 8),
  ('Retraité', 9),
  ('Autre', 10);

-- ================================================
-- VÉRIFICATION
-- ================================================
SELECT 'Secteurs:' as table_name, COUNT(*) as count FROM secteurs
UNION ALL
SELECT 'Statuts professionnels:', COUNT(*) FROM statuts_professionnels;
