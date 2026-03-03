A lire très attentivement
**Contraintes :** 
Ici on travaille étape par étape et selon des règles c'est à dire:
-Si je te pose une question qui necessite de créer un nouveau fichier tu m'avertis d'abord en m'expliquant le pourquoi et à quoi ca va servir et seulement après validation tu pourra avancer
-Si je te pose une question et que tu dois modifier un fichier existant tu m'avertis d'abord en m'expliquant le pourquoi et à quoi ca va servir et seulement après validation tu pourra avancer
-Concernant supabase, si on doit ajouter de nouvelles règles tu les proposes d'abord dans le chat je vais les executer essayer si ca marche je vais te dire on va les mettre avec les autres si ca ne marche pas je te dirai tu vas me donner les instructions pour annuler ce qu'on a fait.
-Tjrs dans supabase si on retire ou annule certaines règles tu dois me le dire aussi pour qu'on les retire des fichiers dans ./supabase/ pour ne faire de conflits plutard
**Ce qui marche pour le moment et qu'on ne touche pas**
- La page de login et sa logique : on ne touche et on me previent avec grande attention avant de faire quoi que ce soit dessus
- L'affichage, l'approbation, et la suppression d'un user depuis l'interface admin
- L'interface du admin il me plait comme ca pour le moment on y touche pas sans m'avertir
- La deconnexion aussi marche
- L'inscription d'un alumni : formulaire → API /api/inscription (service role) → création dans auth.users, users et alumni_profiles + upload du diplôme. L'alumni doit être approuvé par un admin avant de pouvoir se connecter.
**Sur quoi on travaille actuellement**
- La page annuaire des alumni : afficher les alumni (visible_annuaire = true, status = actif) avec leurs profils, filtres, recherche, etc.
-donc la page statique actuelle doit devenir dynamique