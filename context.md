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
- La page annuaire des alumni est maintenant dynamique.
- Si l'utilisateur est connecté : profils réels avec recherche, filtres et pagination.
- Si l'utilisateur n'est pas connecté : aperçu limité de profils aléatoires, sans accès aux détails complets (popup pour se connecter / s'inscrire).
- Les statistiques en bas restent inchangées pour le moment (on y reviendra après).
- La section hero de la page d'accueil a été refaite avec un bloc vidéo fixe (hauteur 400px), masque SVG texte géant alternant ALUMNI puis CONNECT (11s chacun), et disparition du bloc au scroll.
- Le menu de navigation sur la page d'accueil est transparent au départ puis devient bleu navy avec ombre au scroll.
- Le logo du menu a été remplacé avec les nouveaux assets (logo alumni blanc / bleu).
- Sur l'accueil et la page à propos, on utilise maintenant un menu local superposé à l'image/vidéo (menu en dur), avec logo blanc.
- Cliquer sur le logo ou sur le texte "FRANCE ALUMNI CONNECT" redirige vers la page d'accueil.
- Le composant global `components/navigation.tsx` est masqué uniquement sur `/` et `/a-propos`, sans erreur Hooks.
**Sur quoi on travaille actuellement**
on va transformer le menu et la section hero des pages emploi et annuaire exactement comme ce que lon vient de faire avec actualites