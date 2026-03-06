"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, MapPin, Building, GraduationCap, Edit2, Save, X, Loader2, Linkedin, CheckCircle, AlertCircle, FileText, Eye, EyeOff, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AlumniProfile, Secteur, StatutProfessionnel, DiplomeType } from "@/types/database.types"

const DIPLOME_OPTIONS: { value: DiplomeType; label: string }[] = [
  { value: 'licence', label: 'Licence' },
  { value: 'master', label: 'Master' },
  { value: 'doctorat', label: 'Doctorat' },
  { value: 'mba', label: 'MBA' },
  { value: 'ingenieur', label: 'Ingénieur' },
  { value: 'autre', label: 'Autre' },
]

function extractAlumniPhotoPath(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null

  const marker = '/storage/v1/object/public/alumni-photos/'
  const markerIndex = photoUrl.indexOf(marker)
  if (markerIndex === -1) return null

  const path = photoUrl.slice(markerIndex + marker.length)
  return path || null
}

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [alumniProfile, setAlumniProfile] = useState<AlumniProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<AlumniProfile>>({})
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Options pour les selects
  const [secteurs, setSecteurs] = useState<Secteur[]>([])
  const [statutsPro, setStatutsPro] = useState<StatutProfessionnel[]>([])

  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      // Vérifier si l'utilisateur est connecté
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')

      if (authStatus !== 'true' || !userData) {
        router.push('/connexion')
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Si c'est un alumni, charger le profil depuis la base de données
      if (parsedUser.role === 'alumni') {
        try {
          console.log('🔍 Chargement du profil pour user_id:', parsedUser.id)

          // Charger le profil alumni
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: profileData, error: profileError } = await (supabase
            .from('alumni_profiles') as any)
            .select('*')
            .eq('user_id', parsedUser.id)
            .single()

          console.log('📊 Résultat requête profil:', { profileData, profileError })

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('❌ Erreur chargement profil:', JSON.stringify(profileError, null, 2))
            setError(`Erreur lors du chargement du profil: ${profileError.message || 'Erreur inconnue'}`)
          } else if (profileData) {
            console.log('✅ Profil chargé avec succès:', profileData)
            setAlumniProfile(profileData)
            setFormData(profileData)
          } else {
            console.warn('⚠️ Aucun profil trouvé pour cet utilisateur')
            setError('Aucun profil alumni trouvé. Veuillez contacter un administrateur.')
          }

          // Charger les secteurs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: secteursData } = await (supabase
            .from('secteurs') as any)
            .select('*')
            .order('ordre')

          if (secteursData) {
            setSecteurs(secteursData)
          }

          // Charger les statuts professionnels
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: statutsData } = await (supabase
            .from('statuts_professionnels') as any)
            .select('*')
            .order('ordre')

          if (statutsData) {
            setStatutsPro(statutsData)
          }
        } catch (err) {
          console.error('Erreur:', err)
          setError('Erreur lors du chargement des données')
        }
      } else {
        // Pour admin/moderateur, on utilise les données du localStorage
        setFormData({
          nom: parsedUser.nom || '',
          prenom: parsedUser.prenom || '',
        })
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!user || user.role !== 'alumni') return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const previousPhotoPath = extractAlumniPhotoPath(formData.photo_url || null)
      let nextPhotoUrl = formData.photo_url || null
      let uploadedPhotoPath: string | null = null

      if (photoFile) {
        const maxPhotoSize = 3 * 1024 * 1024
        const allowedPhotoTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

        if (photoFile.size > maxPhotoSize) {
          setError('La photo est trop volumineuse (max 3MB)')
          setIsSaving(false)
          return
        }

        if (!allowedPhotoTypes.includes(photoFile.type)) {
          setError('Format photo non autorisé (JPG, PNG, WEBP uniquement)')
          setIsSaving(false)
          return
        }

        const photoExt = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        uploadedPhotoPath = `${user.id}/photo_${Date.now()}.${photoExt}`
        const { error: photoUploadError } = await supabase.storage
          .from('alumni-photos')
          .upload(uploadedPhotoPath, photoFile, {
            contentType: photoFile.type,
            upsert: true,
          })

        if (photoUploadError) {
          console.error('Erreur upload photo:', photoUploadError)
          setError('Erreur lors de l\'upload de la photo')
          setIsSaving(false)
          return
        }

        const { data: photoUrlData } = supabase.storage.from('alumni-photos').getPublicUrl(uploadedPhotoPath)
        nextPhotoUrl = photoUrlData.publicUrl
      }

      // Convertir 'none' en null pour les champs optionnels
      const secteurId = formData.secteur_id === 'none' ? null : (formData.secteur_id || null)
      const statutId = formData.statut_professionnel_id === 'none' ? null : (formData.statut_professionnel_id || null)

      // Seuls les champs modifiables sont mis à jour (pas nom, prenom, telephone)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase
        .from('alumni_profiles') as any)
        .update({
          ville: formData.ville,
          universite: formData.universite,
          annee_promotion: formData.annee_promotion,
          diplome: formData.diplome,
          formation_domaine: formData.formation_domaine,
          secteur_id: secteurId,
          statut_professionnel_id: statutId,
          entreprise: formData.entreprise || null,
          poste_actuel: formData.poste_actuel || null,
          photo_url: nextPhotoUrl,
          bio: formData.bio || null,
          linkedin_url: formData.linkedin_url || null,
          visible_annuaire: formData.visible_annuaire,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Erreur mise à jour:', JSON.stringify(updateError, null, 2))
        const errorMessage = updateError.message || updateError.details || 'Erreur lors de la mise à jour du profil'
        setError(errorMessage)
        if (uploadedPhotoPath) {
          await supabase.storage.from('alumni-photos').remove([uploadedPhotoPath])
        }
        setIsSaving(false)
        return
      }

      // Mettre à jour les états locaux
      setAlumniProfile(data)
      setFormData(data)
      setPhotoFile(null)
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
      setPhotoPreview(null)

      // Si une nouvelle photo a été enregistrée, supprimer l'ancienne du bucket.
      if (uploadedPhotoPath && previousPhotoPath && previousPhotoPath !== uploadedPhotoPath) {
        const { error: oldPhotoDeleteError } = await supabase.storage
          .from('alumni-photos')
          .remove([previousPhotoPath])

        if (oldPhotoDeleteError) {
          // Non bloquant: la sauvegarde du profil a déjà réussi.
          console.warn('Suppression ancienne photo échouée:', oldPhotoDeleteError)
        }
      }

      // Mettre à jour le localStorage pour synchroniser l'avatar dans la navigation.
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedStoredUser = JSON.parse(storedUser)
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...parsedStoredUser,
            photo_url: data.photo_url || null,
          })
        )
      }

      setSuccess('Profil mis à jour avec succès')
      setIsEditing(false)
    } catch (err) {
      console.error('Erreur:', err)
      setError('Une erreur est survenue')
    }

    setIsSaving(false)
  }

  const handleCancel = () => {
    setFormData(alumniProfile || {})
    setPhotoFile(null)
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoPreview(null)
    setIsEditing(false)
    setError(null)
  }

  const getSecteurLibelle = (secteurId: string | null) => {
    if (!secteurId) return 'Non renseigné'
    const secteur = secteurs.find(s => s.id === secteurId)
    return secteur?.libelle || 'Non renseigné'
  }

  const getStatutLibelle = (statutId: string | null) => {
    if (!statutId) return 'Non renseigné'
    const statut = statutsPro.find(s => s.id === statutId)
    return statut?.libelle || 'Non renseigné'
  }

  const getDiplomeLabel = (diplome: DiplomeType | undefined) => {
    if (!diplome) return 'Non renseigné'
    const option = DIPLOME_OPTIONS.find(d => d.value === diplome)
    return option?.label || diplome
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#3558A2]" />
          <p className="text-lg text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAlumni = user.role === 'alumni'
  const displayName = isAlumni
    ? `${formData.prenom || ''} ${formData.nom || ''}`.trim() || user.name
    : user.name

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et professionnelles</p>
        </div>

        {/* Messages d'erreur/succès */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={photoPreview || formData.photo_url || undefined} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white text-xl font-bold">
                      {displayName ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'FA'}
                    </AvatarFallback>
                  </Avatar>
                  {isAlumni && isEditing && (
                    <div className="mb-4 text-left">
                      <Label htmlFor="photo" className="mb-1 block text-sm">Photo de profil (optionnel)</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setPhotoFile(file)
                          if (photoPreview) {
                            URL.revokeObjectURL(photoPreview)
                          }
                          if (file) {
                            setPhotoPreview(URL.createObjectURL(file))
                          } else {
                            setPhotoPreview(null)
                          }
                        }}
                        className="file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#3558A2] file:text-white hover:file:bg-[#3558A2]/90"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP - max 3MB</p>
                    </div>
                  )}
                  <h2 className="font-serif text-xl font-bold mb-1">{displayName}</h2>
                  <Badge className="bg-[#3558A2] hover:bg-[#3558A2]/90">
                    {user.role === 'admin' ? 'Administrateur' : user.role === 'moderateur' ? 'Modérateur' : 'Alumni'}
                  </Badge>
                  {isAlumni && (
                    <div className="mt-2">
                      <Badge variant={user.status === 'actif' ? 'default' : 'secondary'} className={user.status === 'actif' ? 'bg-green-600' : ''}>
                        {user.status === 'actif' ? 'Compte actif' : user.status === 'en_attente' ? 'En attente de validation' : 'Banni'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#3558A2]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {isAlumni && (
                    <>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#3558A2]" />
                        <span>{formData.telephone || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#3558A2]" />
                        <span>{formData.ville || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-[#3558A2]" />
                        <span>{formData.entreprise || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-[#3558A2]" />
                        <span>{formData.universite || 'Non renseigné'}</span>
                      </div>
                      {formData.linkedin_url && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-[#3558A2]" />
                          <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#3558A2] hover:underline truncate">
                            LinkedIn
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {isAlumni && formData.document_diplome_url && (
                  <div className="mt-6">
                    <a
                      href={formData.document_diplome_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#3558A2] hover:bg-[#3558A2]/90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Voir mon diplôme
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informations personnelles</CardTitle>
                {isAlumni && (
                  !isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                      <Button size="sm" onClick={handleSave} className="bg-[#3558A2] hover:bg-[#3558A2]/90" disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Sauvegarder
                      </Button>
                    </div>
                  )
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {!isAlumni ? (
                  // Affichage pour admin/moderateur
                  <div className="text-center py-8">
                    <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      En tant que {user.role === 'admin' ? 'administrateur' : 'modérateur'}, vous n'avez pas de profil alumni.
                    </p>
                  </div>
                ) : (
                  // Affichage pour alumni
                  <>
                    {/* Informations non modifiables */}
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm font-medium">Informations vérifiées (non modifiables)</span>
                      </div>
                      <div className="grid md:grid-cols-1 gap-4">
                        <div>
                          <Label className="mb-0.5 block text-muted-foreground text-xs">Prénom</Label>
                          <p className="font-medium">{formData.prenom || '-'}</p>
                        </div>
                        <div>
                          <Label className="mb-0.5 block text-muted-foreground text-xs">Nom</Label>
                          <p className="font-medium">{formData.nom || '-'}</p>
                        </div>
                        <div>
                          <Label className="mb-0.5 block text-muted-foreground text-xs">Email</Label>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                          <Label className="mb-0.5 block text-muted-foreground text-xs">Téléphone</Label>
                          <p className="font-medium">{formData.telephone || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Localisation */}
                    <div>
                      <Label htmlFor="ville" className="mb-0.5 block">Ville de résidence</Label>
                      <Input
                        id="ville"
                        value={formData.ville || ''}
                        onChange={(e) => setFormData({...formData, ville: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Conakry, Guinée"
                      />
                    </div>

                    {/* Formation */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="universite" className="mb-0.5 block">Université</Label>
                        <Input
                          id="universite"
                          value={formData.universite || ''}
                          onChange={(e) => setFormData({...formData, universite: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="annee_promotion" className="mb-0.5 block">Année de promotion</Label>
                        <Input
                          id="annee_promotion"
                          type="number"
                          value={formData.annee_promotion || ''}
                          onChange={(e) => setFormData({...formData, annee_promotion: parseInt(e.target.value) || 0})}
                          disabled={!isEditing}
                          min="1950"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="diplome" className="mb-0.5 block">Niveau de diplôme</Label>
                        {isEditing ? (
                          <Select
                            value={formData.diplome || 'autre'}
                            onValueChange={(value) => setFormData({...formData, diplome: value as DiplomeType})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un niveau" />
                            </SelectTrigger>
                            <SelectContent>
                              {DIPLOME_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={getDiplomeLabel(formData.diplome)}
                            disabled
                          />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="formation_domaine" className="mb-0.5 block">Domaine de formation</Label>
                        <Input
                          id="formation_domaine"
                          value={formData.formation_domaine || ''}
                          onChange={(e) => setFormData({...formData, formation_domaine: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Informatique, Droit, Médecine..."
                        />
                      </div>
                    </div>

                    {/* Situation professionnelle */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="statut_professionnel" className="mb-0.5 block">Statut professionnel</Label>
                        {isEditing ? (
                          <Select
                            value={formData.statut_professionnel_id || 'none'}
                            onValueChange={(value) => setFormData({...formData, statut_professionnel_id: value === 'none' ? null : value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Non renseigné</SelectItem>
                              {statutsPro.map((statut) => (
                                <SelectItem key={statut.id} value={statut.id}>
                                  {statut.libelle}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={getStatutLibelle(formData.statut_professionnel_id || null)}
                            disabled
                          />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="secteur" className="mb-0.5 block">Secteur d'activité</Label>
                        {isEditing ? (
                          <Select
                            value={formData.secteur_id || 'none'}
                            onValueChange={(value) => setFormData({...formData, secteur_id: value === 'none' ? null : value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un secteur" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Non renseigné</SelectItem>
                              {secteurs.map((secteur) => (
                                <SelectItem key={secteur.id} value={secteur.id}>
                                  {secteur.libelle}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={getSecteurLibelle(formData.secteur_id || null)}
                            disabled
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entreprise" className="mb-0.5 block">Entreprise</Label>
                        <Input
                          id="entreprise"
                          value={formData.entreprise || ''}
                          onChange={(e) => setFormData({...formData, entreprise: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Nom de votre entreprise"
                        />
                      </div>
                      <div>
                        <Label htmlFor="poste_actuel" className="mb-0.5 block">Poste actuel</Label>
                        <Input
                          id="poste_actuel"
                          value={formData.poste_actuel || ''}
                          onChange={(e) => setFormData({...formData, poste_actuel: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Ex: Développeur, Manager..."
                        />
                      </div>
                    </div>

                    {/* Liens */}
                    <div>
                      <Label htmlFor="linkedin_url" className="mb-0.5 block">Profil LinkedIn</Label>
                      <Input
                        id="linkedin_url"
                        value={formData.linkedin_url || ''}
                        onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                        disabled={!isEditing}
                        placeholder="https://linkedin.com/in/votre-profil"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio" className="mb-0.5 block">Biographie</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Parlez-nous de votre parcours et de vos objectifs..."
                      />
                    </div>

                    {/* Visibilité */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {formData.visible_annuaire ? (
                          <Eye className="h-5 w-5 text-green-600" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">Visible dans l'annuaire</p>
                          <p className="text-sm text-muted-foreground">
                            {formData.visible_annuaire
                              ? 'Votre profil est visible par les autres membres'
                              : 'Votre profil est masqué de l\'annuaire'}
                          </p>
                        </div>
                      </div>
                      {isEditing && (
                        <Switch
                          checked={formData.visible_annuaire ?? true}
                          onCheckedChange={(checked) => setFormData({...formData, visible_annuaire: checked})}
                        />
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
