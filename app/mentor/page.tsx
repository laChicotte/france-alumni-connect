"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, Clock, XCircle, Loader2, Users, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { MentorDemande } from "@/types/database.types"
import { cn } from "@/lib/utils"

const AIDES = [
  { id: 'stage', label: 'Recherche de stage' },
  { id: 'etudes', label: 'Parler de mes études' },
  { id: 'metier', label: 'Parler de mon métier' },
  { id: 'cv', label: 'Rédaction CV / Lettre de motivation' },
]

const CANAUX = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'mail', label: 'Mail' },
]

const CRENEAUX = ['Matin', 'Midi', 'Soir'] as const
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const

type Creneau = typeof CRENEAUX[number]
type Jour = typeof JOURS[number]

function dispoArrayToRecord(arr: string[]): Record<string, boolean> {
  return arr.reduce((acc, key) => ({ ...acc, [key]: true }), {})
}

export default function DevenirMentorPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [existingDemande, setExistingDemande] = useState<MentorDemande | null>(null)

  const [aides, setAides] = useState<string[]>([])
  const [maxPersonnes, setMaxPersonnes] = useState<string>('')
  const [canaux, setCanaux] = useState<string[]>([])
  const [disponibilites, setDisponibilites] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const load = async () => {
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')

      if (authStatus !== 'true' || !userData) {
        router.push('/connexion')
        return
      }

      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'alumni') {
        router.push('/profil')
        return
      }

      setUser(parsedUser)

      // Vérifier si une demande existe déjà
      const { data } = await (supabase
        .from('mentor_demandes')
        .select('*')
        .eq('user_id', parsedUser.id)
        .single() as any)

      if (data) {
        setExistingDemande(data as MentorDemande)
        // Pré-remplir le formulaire avec les données existantes
        setAides(data.aides_proposees || [])
        setMaxPersonnes(String(data.max_personnes || ''))
        setCanaux(data.canaux_echange || [])
        setDisponibilites(dispoArrayToRecord(data.disponibilites || []))
      }

      setIsLoading(false)
    }
    load()
  }, [router])

  const toggleDispo = (jour: Jour, creneau: Creneau) => {
    const key = `${jour}_${creneau}`
    setDisponibilites(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAide = (id: string) => {
    setAides(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  const toggleCanal = (id: string) => {
    setCanaux(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const validate = () => {
    if (aides.length === 0) { setError("Veuillez sélectionner au moins un domaine d'aide."); return false }
    if (!maxPersonnes || parseInt(maxPersonnes) < 1) { setError("Veuillez indiquer le nombre maximum de personnes."); return false }
    if (canaux.length === 0) { setError("Veuillez sélectionner au moins un canal d'échange."); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setIsSubmitting(true)

    const dispoArray = Object.entries(disponibilites).filter(([, v]) => v).map(([k]) => k)

    try {
      const { error: insertError } = await (supabase.from('mentor_demandes') as any).insert({
        user_id: user.id,
        aides_proposees: aides,
        max_personnes: parseInt(maxPersonnes),
        canaux_echange: canaux,
        disponibilites: dispoArray,
        statut: 'en_attente',
      } satisfies Omit<MentorDemande, 'id' | 'note_admin' | 'created_at' | 'updated_at'>)

      if (insertError) {
        if (insertError.code === '23505') {
          setError("Vous avez déjà soumis une candidature mentor.")
        } else {
          setError("Une erreur est survenue lors de l'envoi de votre demande.")
        }
        return
      }
      setSubmitted(true)
    } catch {
      setError("Une erreur est survenue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate() || !existingDemande) return

    setIsSubmitting(true)
    const dispoArray = Object.entries(disponibilites).filter(([, v]) => v).map(([k]) => k)

    try {
      const { error: updateError } = await (supabase
        .from('mentor_demandes') as any)
        .update({
          aides_proposees: aides,
          max_personnes: parseInt(maxPersonnes),
          canaux_echange: canaux,
          disponibilites: dispoArray,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDemande.id)

      if (updateError) {
        setError("Une erreur est survenue lors de la mise à jour.")
        return
      }
      toast.success("Vos informations de mentor ont été mises à jour.")
    } catch {
      setError("Une erreur est survenue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3558A2]" />
      </div>
    )
  }

  // ── Soumission réussie (première fois) ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-muted py-8 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Demande envoyée !</h2>
            <p className="text-muted-foreground mb-6">
              Merci pour votre engagement. Votre candidature en tant que mentor a bien été reçue et sera examinée par l'équipe.
            </p>
            <Button asChild className="bg-[#3558A2] hover:bg-[#3558A2]/90">
              <Link href="/profil">Retour à mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Candidature en attente : lecture seule ──
  if (existingDemande && existingDemande.statut === 'en_attente') {
    return (
      <div className="min-h-screen bg-muted py-8 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Candidature en cours d'examen</h2>
            <p className="text-muted-foreground mb-2">
              Votre demande de mentorat a bien été reçue et est en attente de validation par l'équipe.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Soumise le {new Date(existingDemande.created_at).toLocaleDateString('fr-FR')}
            </p>
            <Button asChild className="bg-[#3558A2] hover:bg-[#3558A2]/90">
              <Link href="/profil">Retour à mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Candidature refusée ──
  if (existingDemande && existingDemande.statut === 'refuse') {
    return (
      <div className="min-h-screen bg-muted py-8 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Candidature refusée</h2>
            <p className="text-muted-foreground mb-4">
              Votre demande de mentorat n'a pas été retenue pour le moment.
            </p>
            {existingDemande.note_admin && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-left mb-6">
                <p className="font-medium mb-1">Motif :</p>
                <p>{existingDemande.note_admin}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mb-6">
              Pour plus d'informations, veuillez contacter l'administration.
            </p>
            <Button asChild className="bg-[#3558A2] hover:bg-[#3558A2]/90">
              <Link href="/profil">Retour à mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Formulaire : nouvelle demande ou mise à jour si approuvé ──
  const isApproved = existingDemande?.statut === 'approuve'

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/profil" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-7 w-7 text-[#3558A2]" />
            <h1 className="font-serif text-3xl font-bold">
              {isApproved ? 'Mon profil mentor' : 'Devenir mentor'}
            </h1>
          </div>
          {isApproved ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-green-700 font-medium text-sm">Candidature approuvée — vous pouvez modifier vos informations.</p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              En devenant mentor, vous accompagnez les prochaines générations d'alumni. Quelques questions pour mieux vous connaître.
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={isApproved ? handleUpdate : handleSubmit} className="space-y-6">
          {/* Question 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Je souhaite apporter mon aide concernant :
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {AIDES.map((aide) => (
                  <label
                    key={aide.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors select-none",
                      aides.includes(aide.id)
                        ? "border-[#3558A2] bg-[#3558A2]/5 text-[#3558A2]"
                        : "border-input bg-background hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={aides.includes(aide.id)}
                      onCheckedChange={() => toggleAide(aide.id)}
                      className="data-[state=checked]:bg-[#3558A2] data-[state=checked]:border-[#3558A2]"
                    />
                    <span className="text-sm font-medium">{aide.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Jusqu'à combien de personnes pouvez-vous accompagner en même temps ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 max-w-xs">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={maxPersonnes}
                  onChange={(e) => setMaxPersonnes(e.target.value)}
                  placeholder="Ex : 3"
                  className="w-32 text-center text-lg"
                />
                <Label className="text-muted-foreground text-sm">personne(s)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Question 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Je préfère échanger par :
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {CANAUX.map((canal) => (
                  <label
                    key={canal.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors select-none",
                      canaux.includes(canal.id)
                        ? "border-[#3558A2] bg-[#3558A2]/5 text-[#3558A2]"
                        : "border-input bg-background hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={canaux.includes(canal.id)}
                      onCheckedChange={() => toggleCanal(canal.id)}
                      className="data-[state=checked]:bg-[#3558A2] data-[state=checked]:border-[#3558A2]"
                    />
                    <span className="text-sm font-medium">{canal.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question 4 - Grille disponibilités */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                De manière générale, vous êtes plutôt disponible :
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-28"></th>
                      {CRENEAUX.map((c) => (
                        <th key={c} className="text-center py-2 px-4 font-semibold text-[#3558A2]">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {JOURS.map((jour, idx) => (
                      <tr key={jour} className={cn("border-t", idx % 2 === 0 ? "bg-muted/30" : "bg-background")}>
                        <td className="py-3 pr-4 font-medium">{jour}</td>
                        {CRENEAUX.map((creneau) => {
                          const key = `${jour}_${creneau}`
                          return (
                            <td key={creneau} className="py-3 px-4 text-center">
                              <Checkbox
                                checked={!!disponibilites[key]}
                                onCheckedChange={() => toggleDispo(jour, creneau)}
                                className="data-[state=checked]:bg-[#3558A2] data-[state=checked]:border-[#3558A2]"
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-[#3558A2] hover:bg-[#3558A2]/90 h-12 text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Enregistrement...</>
            ) : isApproved ? (
              <><Save className="h-5 w-5 mr-2" />Mettre à jour mes informations</>
            ) : (
              'Soumettre ma candidature'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
