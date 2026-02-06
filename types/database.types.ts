export type UserRole = 'admin' | 'moderateur' | 'alumni'
export type UserStatus = 'en_attente' | 'actif' | 'banni'
export type DiplomeType = 'licence' | 'master' | 'doctorat' | 'mba' | 'ingenieur' | 'autre'
export type ArticleStatus = 'brouillon' | 'publie'
export type JobType = 'cdi' | 'cdd' | 'stage' | 'freelance' | 'alternance'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nom: string | null
          prenom: string | null
          photo_url: string | null
          role: UserRole
          status: UserStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nom?: string | null
          prenom?: string | null
          photo_url?: string | null
          role?: UserRole
          status?: UserStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nom?: string | null
          prenom?: string | null
          photo_url?: string | null
          role?: UserRole
          status?: UserStatus
          updated_at?: string
        }
      }
      alumni_profiles: {
        Row: {
          id: string
          user_id: string
          nom: string
          prenom: string
          photo_url: string | null
          telephone: string
          ville: string
          universite: string
          annee_promotion: number
          diplome: DiplomeType
          formation_domaine: string
          statut_professionnel_id: string | null
          secteur_id: string | null
          entreprise: string | null
          poste_actuel: string | null
          bio: string | null
          linkedin_url: string | null
          visible_annuaire: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nom: string
          prenom: string
          photo_url?: string | null
          telephone: string
          ville: string
          universite: string
          annee_promotion: number
          diplome: DiplomeType
          formation_domaine: string
          statut_professionnel_id?: string | null
          secteur_id?: string | null
          entreprise?: string | null
          poste_actuel?: string | null
          bio?: string | null
          linkedin_url?: string | null
          visible_annuaire?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          nom?: string
          prenom?: string
          photo_url?: string | null
          telephone?: string
          ville?: string
          universite?: string
          annee_promotion?: number
          diplome?: DiplomeType
          formation_domaine?: string
          statut_professionnel_id?: string | null
          secteur_id?: string | null
          entreprise?: string | null
          poste_actuel?: string | null
          bio?: string | null
          linkedin_url?: string | null
          visible_annuaire?: boolean
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          titre: string
          slug: string
          extrait: string | null
          contenu: string
          image_url: string | null
          tags: string | null
          categorie_id: string | null
          auteur_id: string | null
          status: ArticleStatus
          date_publication: string | null
          vues: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titre: string
          slug: string
          extrait?: string | null
          contenu: string
          image_url?: string | null
          tags?: string | null
          categorie_id?: string | null
          auteur_id?: string | null
          status?: ArticleStatus
          date_publication?: string | null
          vues?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          titre?: string
          slug?: string
          extrait?: string | null
          contenu?: string
          image_url?: string | null
          tags?: string | null
          categorie_id?: string | null
          auteur_id?: string | null
          status?: ArticleStatus
          date_publication?: string | null
          vues?: number
          updated_at?: string
        }
      }
      emplois: {
        Row: {
          id: string
          titre: string
          entreprise: string
          localisation: string
          type_contrat: JobType
          secteur_id: string | null
          description: string
          profil_recherche: string | null
          teletravail: boolean
          email_contact: string
          lien_postuler: string | null
          fichier_url: string | null
          date_expiration: string | null
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titre: string
          entreprise: string
          localisation: string
          type_contrat: JobType
          secteur_id?: string | null
          description: string
          profil_recherche?: string | null
          teletravail?: boolean
          email_contact: string
          lien_postuler?: string | null
          fichier_url?: string | null
          date_expiration?: string | null
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          titre?: string
          entreprise?: string
          localisation?: string
          type_contrat?: JobType
          secteur_id?: string | null
          description?: string
          profil_recherche?: string | null
          teletravail?: boolean
          email_contact?: string
          lien_postuler?: string | null
          fichier_url?: string | null
          date_expiration?: string | null
          actif?: boolean
          updated_at?: string
        }
      }
      evenements: {
        Row: {
          id: string
          titre: string
          slug: string
          date: string
          heure: string
          lieu: string
          type_evenement_id: string | null
          description: string
          image_url: string
          places_max: number | null
          lien_visio: string | null
          organisateur_id: string | null
          archive: boolean
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titre: string
          slug: string
          date: string
          heure: string
          lieu: string
          type_evenement_id?: string | null
          description: string
          image_url: string
          places_max?: number | null
          lien_visio?: string | null
          organisateur_id?: string | null
          archive?: boolean
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          titre?: string
          slug?: string
          date?: string
          heure?: string
          lieu?: string
          type_evenement_id?: string | null
          description?: string
          image_url?: string
          places_max?: number | null
          lien_visio?: string | null
          organisateur_id?: string | null
          archive?: boolean
          actif?: boolean
          updated_at?: string
        }
      }
      inscriptions_evenements: {
        Row: {
          id: string
          evenement_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          evenement_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          evenement_id?: string
          user_id?: string
        }
      }
      partenaires: {
        Row: {
          id: string
          nom: string
          logo_url: string
          site_web: string | null
          description: string | null
          ordre: number
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          logo_url: string
          site_web?: string | null
          description?: string | null
          ordre?: number
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          nom?: string
          logo_url?: string
          site_web?: string | null
          description?: string | null
          ordre?: number
          actif?: boolean
          updated_at?: string
        }
      }
      secteurs: {
        Row: {
          id: string
          libelle: string
          ordre: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          libelle: string
          ordre?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          libelle?: string
          ordre?: number
          updated_at?: string
        }
      }
      statuts_professionnels: {
        Row: {
          id: string
          libelle: string
          ordre: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          libelle: string
          ordre?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          libelle?: string
          ordre?: number
          updated_at?: string
        }
      }
      categories_articles: {
        Row: {
          id: string
          libelle: string
          ordre: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          libelle: string
          ordre?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          libelle?: string
          ordre?: number
          updated_at?: string
        }
      }
      types_evenements: {
        Row: {
          id: string
          libelle: string
          ordre: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          libelle: string
          ordre?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          libelle?: string
          ordre?: number
          updated_at?: string
        }
      }
    }
  }
}

// Types utilitaires
export type User = Database['public']['Tables']['users']['Row']
export type AlumniProfile = Database['public']['Tables']['alumni_profiles']['Row']
export type Article = Database['public']['Tables']['articles']['Row']
export type Emploi = Database['public']['Tables']['emplois']['Row']
export type Evenement = Database['public']['Tables']['evenements']['Row']
export type InscriptionEvenement = Database['public']['Tables']['inscriptions_evenements']['Row']
export type Partenaire = Database['public']['Tables']['partenaires']['Row']
export type Secteur = Database['public']['Tables']['secteurs']['Row']
export type StatutProfessionnel = Database['public']['Tables']['statuts_professionnels']['Row']
export type CategorieArticle = Database['public']['Tables']['categories_articles']['Row']
export type TypeEvenement = Database['public']['Tables']['types_evenements']['Row']
