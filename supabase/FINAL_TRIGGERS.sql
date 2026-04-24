-- ================================================
-- TOUS LES TRIGGERS - VERSION FINALE
-- France Alumni Guinée
-- ================================================

-- NOTE: Tous les triggers utilisent la fonction update_updated_at()
-- qui doit être créée avec FINAL_FUNCTIONS.sql

-- ================================================
-- TRIGGERS UPDATE_UPDATED_AT
-- ================================================

-- Table: users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Table: alumni_profiles
DROP TRIGGER IF EXISTS update_alumni_profiles_updated_at ON alumni_profiles;
CREATE TRIGGER update_alumni_profiles_updated_at
  BEFORE UPDATE ON alumni_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Table: articles
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Table: evenements
DROP TRIGGER IF EXISTS update_evenements_updated_at ON evenements;
CREATE TRIGGER update_evenements_updated_at
  BEFORE UPDATE ON evenements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Table: emplois
DROP TRIGGER IF EXISTS update_emplois_updated_at ON emplois;
CREATE TRIGGER update_emplois_updated_at
  BEFORE UPDATE ON emplois
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Table: partenaires
DROP TRIGGER IF EXISTS update_partenaires_updated_at ON partenaires;
CREATE TRIGGER update_partenaires_updated_at
  BEFORE UPDATE ON partenaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Table: inscriptions_evenements
-- Vérifie la capacité max avant inscription
DROP TRIGGER IF EXISTS trg_check_event_capacity ON inscriptions_evenements;
CREATE TRIGGER trg_check_event_capacity
  BEFORE INSERT ON inscriptions_evenements
  FOR EACH ROW
  EXECUTE FUNCTION check_event_capacity();

-- Table: formations
DROP TRIGGER IF EXISTS update_formations_updated_at ON formations;
CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Table: types_formations
DROP TRIGGER IF EXISTS update_types_formations_updated_at ON types_formations;
CREATE TRIGGER update_types_formations_updated_at
  BEFORE UPDATE ON types_formations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Table: inscriptions_formations
-- Vérifie la capacité max avant inscription
DROP TRIGGER IF EXISTS trg_check_formation_capacity ON inscriptions_formations;
CREATE TRIGGER trg_check_formation_capacity
  BEFORE INSERT ON inscriptions_formations
  FOR EACH ROW
  EXECUTE FUNCTION check_formation_capacity();

-- Table: mentor_demandes
DROP TRIGGER IF EXISTS update_mentor_demandes_updated_at ON mentor_demandes;
CREATE TRIGGER update_mentor_demandes_updated_at
  BEFORE UPDATE ON mentor_demandes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ================================================
-- NOTE IMPORTANTE:
-- Il n'y a PAS de trigger sur auth.users
-- La création des profils se fait MANUELLEMENT dans le code
-- ================================================
