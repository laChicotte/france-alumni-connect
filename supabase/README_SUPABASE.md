# Configuration Supabase - France Alumni Guinée

## 📋 Ordre d'exécution des scripts

Pour configurer Supabase de zéro, exécutez les scripts dans cet ordre :

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

### Champ genre (alumni_profiles)
- Colonne: `alumni_profiles.genre`
- Valeurs autorisées: `Homme`, `Femme`, `Autre`
- Valeur par défaut: `Autre`
- Colonne non nulle (`NOT NULL`)

### Statuts des utilisateurs
- `en_attente` : Compte créé, en attente de validation admin
- `actif` : Compte validé par un admin
- `suspendu` : Compte suspendu temporairement

### Rôles
- `admin` : Accès complet
- `moderateur` : Peut créer/modifier articles, événements, emplois
- `alumni` : Utilisateur standard

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
- [ ] Tables `secteurs` et `statuts_professionnels` peuplées
- [ ] Tester l'inscription d'un nouvel alumni
- [ ] Vérifier que le diplôme s'upload correctement
- [ ] Vérifier que la photo de profil s'upload correctement
- [ ] Vérifier que `genre` est bien renseigné à l'inscription et modifiable dans le profil alumni
- [ ] Vérifier que le profil s'affiche après validation admin
