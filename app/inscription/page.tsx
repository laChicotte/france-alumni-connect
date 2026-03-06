"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"

export default function InscriptionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    prenom: "",
    nom: "",
    genre: "Autre",
    telephone: "",
    universite: "",
    annee_promotion: "",
    terms: false,
  })
  const [diplomeFile, setDiplomeFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setIsLoading(false)
      return
    }

    if (!formData.terms) {
      setError("Vous devez accepter les conditions d'utilisation")
      setIsLoading(false)
      return
    }

    if (!diplomeFile) {
      setError("Veuillez joindre votre diplôme")
      setIsLoading(false)
      return
    }

    // Vérifier la taille du fichier (max 5MB)
    if (diplomeFile.size > 5 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (max 5MB)")
      setIsLoading(false)
      return
    }

    if (photoFile && photoFile.size > 3 * 1024 * 1024) {
      setError("La photo est trop volumineuse (max 3MB)")
      setIsLoading(false)
      return
    }

    try {
      const body = new FormData()
      body.append('email', formData.email)
      body.append('password', formData.password)
      body.append('prenom', formData.prenom)
      body.append('nom', formData.nom)
      body.append('genre', formData.genre)
      body.append('telephone', formData.telephone)
      body.append('universite', formData.universite)
      body.append('annee_promotion', formData.annee_promotion)
      body.append('diplome', diplomeFile)
      if (photoFile) {
        body.append('photo', photoFile)
      }

      const res = await fetch('/api/inscription', {
        method: 'POST',
        body,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue. Veuillez réessayer.")
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error('Erreur inscription:', err)
      setError("Une erreur est survenue. Veuillez réessayer.")
    }

    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="font-serif text-2xl">Inscription réussie !</CardTitle>
            <CardDescription className="mt-2">
              Votre demande a été enregistrée. Un administrateur va valider votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Vous recevrez un email une fois votre compte activé.
            </p>
            <Button
              className="w-full bg-[#3558A2] hover:bg-[#3558A2]/90"
              onClick={() => router.push('/connexion')}
            >
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#3558A2] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">FA</span>
          </div>
          <CardTitle className="font-serif text-2xl">Rejoignez France Alumni Guinée</CardTitle>
          <CardDescription>Créez votre compte pour accéder au réseau</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <select
                id="genre"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.genre}
                onChange={handleInputChange}
                required
              >
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+224 6XX XX XX XX"
                value={formData.telephone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="universite">Université française *</Label>
              <Input
                id="universite"
                placeholder="Ex: Université Paris-Saclay"
                value={formData.universite}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annee_promotion">Année de promotion *</Label>
              <Input
                id="annee_promotion"
                type="number"
                placeholder="Ex: 2020"
                min="1950"
                max={new Date().getFullYear()}
                value={formData.annee_promotion}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo de profil (JPG, PNG, WEBP) - optionnel</Label>
              <Input
                id="photo"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#3558A2] file:text-white hover:file:bg-[#3558A2]/90"
              />
              <p className="text-xs text-muted-foreground">
                Ajoutez une photo de profil (max 3MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diplome">Diplôme français (PDF, JPG, PNG) *</Label>
              <Input
                id="diplome"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDiplomeFile(e.target.files?.[0] || null)}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#3558A2] file:text-white hover:file:bg-[#3558A2]/90"
              />
              <p className="text-xs text-muted-foreground">
                Joindre votre dernier diplôme français (max 5MB)
              </p>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => handleCheckboxChange('terms', checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                J'accepte les{" "}
                <Link href="/conditions" className="text-[#3558A2] hover:underline">
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/confidentialite" className="text-[#3558A2] hover:underline">
                  politique de confidentialité
                </Link> *
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3558A2] hover:bg-[#3558A2]/90"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link href="/connexion" className="text-[#3558A2] font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
