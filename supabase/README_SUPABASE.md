# Configuration Supabase - France Alumni Guinée

## 📋 Ordre d'exécution des scripts

Pour configurer Supabase de zéro, exécutez les scripts dans cet ordre :

### 0. **FINAL_SCHEMA.sql** ← À exécuter EN PREMIER
- Crée tous les types ENUM (`diplome_type`, `genre_type`, `nationalite_type`, etc.)
- Crée toutes les tables avec leurs colonnes, contraintes et index
- Active RLS sur chaque table
- Idempotent (`IF NOT EXISTS` partout)

### 1. **FINAL_FUNCTIONS.sql**
- Créer toutes les fonctions personnalisées
- Notamment `delete_user_completely()` et `update_updated_at()`

### 2. **FINAL_TRIGGERS.sql**
- Créer tous les triggers (update_updated_at sur chaque table)
- **NOTE**: Pas de trigger sur `auth.users` - création manuelle dans le code

### 3. **FINAL_RLS_POLICIES.sql**
- Créer toutes les Row Level Security policies
- Contrôle d'accès pour toutes les tables

### 4. **FINAL_STORAGE.sql**
- Créer le bucket `diplomes`
- Créer le bucket `alumni-photos`
- Créer le bucket `articles-media`
- Créer le bucket `evenements-media`
- Créer le bucket `logo-partenaire`
- Créer les policies de sécurité pour le storage

### 5. **FINAL_SEEDERS.sql**
- Peupler les tables `secteurs` et `statuts_professionnels`
- Données pour les dropdowns de l'interface

---

## 🔍 Scripts utilitaires (pour inspection)

Ces scripts ne modifient rien, ils permettent de lister ce qui existe :

- **list-all-triggers.sql** - Lister tous les triggers
- **list-all-functions.sql** - Lister toutes les fonctions

---

## ⚠️ Notes importantes

### Inscription des utilisateurs
- **Pas de trigger automatique** sur `auth.users`
- La logique d'inscription est gérée par l'**API route** `/api/inscription` (service role, bypass RLS)
- Étapes : `admin.createUser` → insérer dans `users` → upload diplôme → insérer dans `alumni_profiles`
- Nécessite `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`

### Upload du diplôme
- **OBLIGATOIRE** lors de l'inscription
- Taille max : **5MB**
- Formats acceptés : **PDF, JPG, PNG**
- Stocké dans le bucket `diplomes` avec le path `{user_id}/diplome_{timestamp}.{ext}`

### Upload photo de profil
- **Optionnel** lors de l'inscription
- Modifiable depuis la page profil
- Taille max : **3MB**
- Formats acceptés : **JPG, PNG, WEBP**
- Stocké dans le bucket `alumni-photos` avec le path `{user_id}/photo_{timestamp}.{ext}`
- URL sauvegardée dans `alumni_profiles.photo_url`

### Champ diplome (alumni_profiles)
- Colonne: `alumni_profiles.diplome`
- Type: ENUM `diplome_type`
- Valeurs (15): `bts`, `dut`, `du`, `de`, `deug`, `prepa`, `ecole_ingenieur`, `ecole_specialisee`, `licence_pro`, `licence`, `master1`, `master2`, `doctorat`, `post_doctorat`, `autre`
- Obligatoire (`NOT NULL`)

### Champ bourse (alumni_profiles)
- Colonne: `alumni_profiles.bourse`
- Type: TEXT avec contrainte CHECK
- Valeurs: `Non boursier`, `Boursier Etat français`, `Boursier Etat guinéen`, `Boursier Etats français et guinéen`
- Optionnel (nullable)

### Champ secteur_libre (alumni_profiles) — migration appliquée
- Colonne: `alumni_profiles.secteur_libre`
- Type: TEXT nullable
- Rôle: stocke le texte libre saisi par l'alumni quand il choisit "Autre" dans la liste déroulante secteur d'activité
- Limité à 20 caractères côté formulaire et API
- Quand renseigné, `secteur_id` est `NULL`
- **SQL exécuté** :
  ```sql
  ALTER TABLE public.alumni_profiles
    ADD COLUMN IF NOT EXISTS secteur_libre TEXT;
  ```

### Champ genre (alumni_profiles)
- Colonne: `alumni_profiles.genre`
- Valeurs autorisées: `Homme`, `Femme`, `Autre`
- Valeur par défaut: `Autre`
- Colonne non nulle (`NOT NULL`)

### Champ nationalite (alumni_profiles)
- Colonne: `alumni_profiles.nationalite`
- Valeurs autorisées: `Guinéenne`, `Franco-Guinéenne`, `Guinéenne-Autre`
- Valeur par défaut: `Guinéenne`
- Colonne non nulle (`NOT NULL`) avec contrainte `CHECK`
- Obligatoire à l'inscription, modifiable depuis la page profil alumni

### Statuts des utilisateurs
- `en_attente` : Compte créé, en attente de validation admin
- `actif` : Compte validé par un admin
- `suspendu` : Compte suspendu temporairement

### Rôles
- `admin` : Accès complet
- `moderateur` : Peut créer/modifier articles, événements, emplois et partenaires
- `alumni` : Utilisateur standard

### Module Articles (v2 admin)
- Table `articles` réalignée avec:
  - `image_couverture_url` (obligatoire)
  - `status` (`brouillon`/`publie`)
  - `date_publication`
- Table `article_media` ajoutée pour gérer les médias de fin d'article (image/vidéo + ordre)
- Bucket storage `articles-media` ajouté (images + vidéos)
- RLS `articles`/`article_media`:
  - `admin` gère tout
  - `moderateur` gère uniquement ses contenus (`auteur_id = auth.uid()`)
  - lecture du contenu publié côté utilisateurs authentifiés

### Module Événements (simple)
- Table `evenements` utilisée en mode simple (cartes + inscription)
- RLS `evenements`:
  - lecture visible: `actif = true` et `archive = false`
  - `admin` gère tout
  - `moderateur` gère ses événements (`organisateur_id = auth.uid()`)
- Table `inscriptions_evenements`:
  - index unique `(evenement_id, user_id)` pour éviter les doubles inscriptions
  - trigger `check_event_capacity()` pour bloquer les événements complets
  - policies dédiées (inscription/annulation/lecture)
- Bucket `evenements-media`:
  - image événement en upload (optionnelle côté formulaire admin)

### Module Partenaires
- Table `partenaires` utilisée pour la section publique "Nos partenaires"
- Backoffice `/admin/partenaires`:
  - upload logo depuis formulaire (bucket `logo-partenaire`)
  - gestion `nom`, `logo_url`, `site_web`, `description`, visibilité (`actif`)
- RLS `partenaires`:
  - `admin` et `moderateur` ont les mêmes droits (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- Bucket `logo-partenaire`:
  - lecture publique
  - upload / update / delete réservés à `admin` et `moderateur`

---

## 📁 Structure des fichiers obsolètes

Ces fichiers sont conservés pour historique mais **ne doivent plus être utilisés** :

- `setup-complete.sql` - Anciennes tentatives de trigger
- `fix-trigger-simple.sql` - Anciennes tentatives de trigger
- `trigger-inscription-complete.sql` - Anciennes tentatives de trigger
- `rls-policies.sql` - Remplacé par FINAL_RLS_POLICIES.sql
- `rls-policies-fix.sql` - Remplacé par FINAL_RLS_POLICIES.sql
- `fix-rls-inscription.sql` - Intégré dans FINAL_RLS_POLICIES.sql
- `add-delete-policies.sql` - Intégré dans FINAL_RLS_POLICIES.sql
- `seed-secteurs-statuts.sql` - Remplacé par FINAL_SEEDERS.sql
- `fix-missing-alumni-profiles.sql` - Utilitaire ponctuel (ne plus utiliser)
- `add-diplome-field.sql` - Migration déjà appliquée

---

## ✅ Checklist de vérification

Après avoir exécuté les scripts, vérifier :

- [ ] Fonctions créées : `delete_user_completely`, `update_updated_at`
- [ ] Triggers créés sur : `users`, `alumni_profiles`, `articles`, `evenements`, `emplois`, `partenaires`
- [ ] RLS activé sur toutes les tables principales
- [ ] Bucket `diplomes` créé avec policies
- [ ] Bucket `alumni-photos` créé avec policies
- [ ] Bucket `articles-media` créé avec policies
- [ ] Bucket `evenements-media` créé avec policies
- [ ] Bucket `logo-partenaire` créé avec policies
- [ ] Tables `secteurs` et `statuts_professionnels` peuplées
- [ ] Tester l'inscription d'un nouvel alumni
- [ ] Vérifier que le diplôme s'upload correctement
- [ ] Vérifier que la photo de profil s'upload correctement
- [ ] Vérifier que la couverture article s'upload correctement (`articles-media`)
- [ ] Vérifier que les médias de fin d'article s'upload correctement (`article_media`)
- [ ] Vérifier qu'un utilisateur peut s'inscrire à un événement ouvert
- [ ] Vérifier qu'on ne peut pas s'inscrire 2 fois au même événement
- [ ] Vérifier qu'un événement complet bloque les nouvelles inscriptions
- [ ] Vérifier que la photo événement s'upload correctement (`evenements-media`)
- [ ] Vérifier que le logo partenaire s'upload correctement (`logo-partenaire`)
- [ ] Vérifier que `genre` est bien renseigné à l'inscription et modifiable dans le profil alumni
- [ ] Vérifier que `nationalite` est bien renseigné à l'inscription et modifiable dans le profil alumni
- [ ] Vérifier que le profil s'affiche après validation admin
