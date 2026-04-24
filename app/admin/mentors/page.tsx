"use client"

import { useEffect, useState } from "react"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye, Check, X, Trash2, Loader2, Users, Mail, Phone,
  GraduationCap, Building, MapPin, AlertCircle, CheckCircle2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { MentorDemande, MentorStatut } from "@/types/database.types"

const AIDES_LABELS: Record<string, string> = {
  stage: 'Recherche de stage',
  etudes: 'Parler de mes études',
  metier: 'Parler de mon métier',
  cv: 'Rédaction CV / Lettre de motivation',
}

const CANAUX_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  mail: 'Mail',
}

const CRENEAUX = ['Matin', 'Midi', 'Soir'] as const
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const

interface AlumniInfo {
  prenom: string | null
  nom: string | null
  photo_url: string | null
  telephone: string | null
  ville: string | null
  universite: string | null
  annee_promotion: number | null
  entreprise: string | null
  poste_actuel: string | null
  email?: string | null
}

interface MentorDemandeWithAlumni extends MentorDemande {
  alumni: AlumniInfo | null
}

function statutBadge(statut: MentorStatut) {
  if (statut === 'approuve') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approuvé</Badge>
  if (statut === 'en_attente') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En attente</Badge>
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Refusé</Badge>
}

function displayName(alumni: AlumniInfo | null) {
  if (!alumni) return 'Alumni inconnu'
  return `${alumni.prenom || ''} ${alumni.nom || ''}`.trim() || 'Alumni inconnu'
}

function initials(alumni: AlumniInfo | null) {
  const name = displayName(alumni)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AL'
}

export default function MentorsAdminPage() {
  const [demandes, setDemandes] = useState<MentorDemandeWithAlumni[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog vue détail
  const [viewDemande, setViewDemande] = useState<MentorDemandeWithAlumni | null>(null)

  // Dialog approbation / refus
  const [actionDemande, setActionDemande] = useState<MentorDemandeWithAlumni | null>(null)
  const [actionType, setActionType] = useState<'approuve' | 'refuse' | null>(null)
  const [noteAdmin, setNoteAdmin] = useState('')

  useEffect(() => { fetchDemandes() }, [])

  const fetchDemandes = async () => {
    setIsLoading(true)

    const { data: demandesData, error } = await (supabase
      .from('mentor_demandes')
      .select('*')
      .order('created_at', { ascending: false }) as any)

    if (error || !demandesData || demandesData.length === 0) {
      setDemandes([])
      setIsLoading(false)
      return
    }

    const userIds = (demandesData as any[]).map((d) => d.user_id)

    const [{ data: usersData }, { data: profilesData }] = await Promise.all([
      (supabase.from('users').select('id, email').in('id', userIds) as any),
      (supabase.from('alumni_profiles')
        .select('user_id, prenom, nom, photo_url, telephone, ville, universite, annee_promotion, entreprise, poste_actuel')
        .in('user_id', userIds) as any),
    ])

    const enriched = (demandesData as any[]).map((d) => {
      const user = (usersData || []).find((u: any) => u.id === d.user_id)
      const profile = (profilesData || []).find((p: any) => p.user_id === d.user_id)
      return {
        ...d,
        alumni: profile
          ? { ...profile, email: user?.email || null }
          : { prenom: null, nom: null, photo_url: null, telephone: null, ville: null, universite: null, annee_promotion: null, entreprise: null, poste_actuel: null, email: user?.email || null },
      }
    })

    setDemandes(enriched as MentorDemandeWithAlumni[])
    setIsLoading(false)
  }

  const handleAction = async () => {
    if (!actionDemande || !actionType) return
    setIsSubmitting(true)
    setFeedback(null)

    const { error } = await (supabase
      .from('mentor_demandes') as any)
      .update({
        statut: actionType,
        note_admin: noteAdmin.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', actionDemande.id)

    if (error) {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour.' })
    } else {
      setFeedback({
        type: 'success',
        message: actionType === 'approuve' ? 'Candidature approuvée.' : 'Candidature refusée.',
      })
      setActionDemande(null)
      setActionType(null)
      setNoteAdmin('')
      fetchDemandes()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (demande: MentorDemandeWithAlumni) => {
    if (!confirm(`Supprimer la candidature de ${displayName(demande.alumni)} ?`)) return
    setFeedback(null)
    const { error } = await (supabase.from('mentor_demandes').delete().eq('id', demande.id) as any)
    if (error) {
      setFeedback({ type: 'error', message: 'Erreur lors de la suppression.' })
    } else {
      setFeedback({ type: 'success', message: 'Candidature supprimée.' })
      fetchDemandes()
    }
  }

  const enAttente = demandes.filter(d => d.statut === 'en_attente').length

  return (
    <AdminWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-[#3558A2]" />
              Candidatures Mentor
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {demandes.length} candidature{demandes.length > 1 ? 's' : ''} au total
              {enAttente > 0 && (
                <span className="ml-2 text-amber-600 font-medium">· {enAttente} en attente</span>
              )}
            </p>
          </div>
        </div>

        {feedback && (
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}
            className={feedback.type === 'success' ? 'border-green-500 bg-green-50' : ''}>
            {feedback.type === 'success'
              ? <CheckCircle2 className="h-4 w-4 text-green-600" />
              : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className={feedback.type === 'success' ? 'text-green-700' : ''}>
              {feedback.message}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#3558A2]" />
          </div>
        ) : demandes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Aucune candidature mentor pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {demandes.map((demande) => (
              <Card key={demande.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={demande.alumni?.photo_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[#3558A2] to-[#1e3a7b] text-white font-bold">
                        {initials(demande.alumni)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Infos principales */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{displayName(demande.alumni)}</span>
                        {statutBadge(demande.statut)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                        {demande.alumni?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {demande.alumni.email}
                          </span>
                        )}
                        {demande.alumni?.ville && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {demande.alumni.ville}
                          </span>
                        )}
                        <span className="text-xs">
                          Soumis le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {/* Aperçu rapide aides */}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {demande.aides_proposees.map(a => (
                          <span key={a} className="text-xs bg-[#3558A2]/10 text-[#3558A2] px-2 py-0.5 rounded-full">
                            {AIDES_LABELS[a] || a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewDemande(demande)}
                        title="Voir le formulaire"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {demande.statut !== 'approuve' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => { setActionDemande(demande); setActionType('approuve'); setNoteAdmin('') }}
                          title="Approuver"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {demande.statut !== 'refuse' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => { setActionDemande(demande); setActionType('refuse'); setNoteAdmin('') }}
                          title="Refuser"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-red-600"
                        onClick={() => handleDelete(demande)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Dialog : Vue détail formulaire ── */}
      <Dialog open={!!viewDemande} onOpenChange={(o) => !o && setViewDemande(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidature mentor</DialogTitle>
          </DialogHeader>

          {viewDemande && (
            <div className="space-y-6">
              {/* En-tête alumni */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16 shrink-0">
                  <AvatarImage src={viewDemande.alumni?.photo_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#3558A2] to-[#1e3a7b] text-white text-xl font-bold">
                    {initials(viewDemande.alumni)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-lg">{displayName(viewDemande.alumni)}</h3>
                    {statutBadge(viewDemande.statut)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-muted-foreground">
                    {viewDemande.alumni?.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#3558A2]" />
                        {viewDemande.alumni.email}
                      </span>
                    )}
                    {viewDemande.alumni?.telephone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#3558A2]" />
                        {viewDemande.alumni.telephone}
                      </span>
                    )}
                    {viewDemande.alumni?.ville && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#3558A2]" />
                        {viewDemande.alumni.ville}
                      </span>
                    )}
                    {viewDemande.alumni?.universite && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-[#3558A2]" />
                        {viewDemande.alumni.universite}
                        {viewDemande.alumni.annee_promotion && ` · Promo ${viewDemande.alumni.annee_promotion}`}
                      </span>
                    )}
                    {viewDemande.alumni?.entreprise && (
                      <span className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-[#3558A2]" />
                        {viewDemande.alumni.entreprise}
                        {viewDemande.alumni.poste_actuel && ` — ${viewDemande.alumni.poste_actuel}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Q1 — Aides */}
              <div>
                <p className="text-sm font-semibold text-[#3558A2] uppercase tracking-wide mb-2">
                  Domaines d'aide proposés
                </p>
                <div className="flex flex-wrap gap-2">
                  {viewDemande.aides_proposees.map(a => (
                    <span key={a} className="px-3 py-1.5 rounded-lg border border-[#3558A2] bg-[#3558A2]/5 text-[#3558A2] text-sm font-medium">
                      {AIDES_LABELS[a] || a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Q2 — Max personnes */}
              <div>
                <p className="text-sm font-semibold text-[#3558A2] uppercase tracking-wide mb-2">
                  Capacité d'accompagnement
                </p>
                <p className="text-sm">
                  Jusqu'à <span className="font-bold text-base">{viewDemande.max_personnes}</span> personne{viewDemande.max_personnes > 1 ? 's' : ''} en même temps
                </p>
              </div>

              {/* Q3 — Canaux */}
              <div>
                <p className="text-sm font-semibold text-[#3558A2] uppercase tracking-wide mb-2">
                  Canaux d'échange préférés
                </p>
                <div className="flex gap-2">
                  {viewDemande.canaux_echange.map(c => (
                    <span key={c} className="px-3 py-1.5 rounded-lg border border-[#3558A2] bg-[#3558A2]/5 text-[#3558A2] text-sm font-medium">
                      {CANAUX_LABELS[c] || c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Q4 — Disponibilités (grille) */}
              <div>
                <p className="text-sm font-semibold text-[#3558A2] uppercase tracking-wide mb-2">
                  Disponibilités
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-28"></th>
                        {CRENEAUX.map(c => (
                          <th key={c} className="text-center py-2 px-4 font-semibold text-[#3558A2]">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {JOURS.map((jour, idx) => (
                        <tr key={jour} className={idx % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
                          <td className="py-2.5 pr-4 font-medium border-t">{jour}</td>
                          {CRENEAUX.map(creneau => {
                            const checked = viewDemande.disponibilites.includes(`${jour}_${creneau}`)
                            return (
                              <td key={creneau} className="py-2.5 px-4 text-center border-t">
                                {checked
                                  ? <Check className="h-4 w-4 text-green-600 mx-auto" />
                                  : <span className="block w-4 h-4 mx-auto rounded-sm border border-muted-foreground/30 bg-muted/50" />
                                }
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note admin si présente */}
              {viewDemande.note_admin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <p className="font-medium text-amber-700 mb-1">Note administrative</p>
                  <p className="text-amber-800">{viewDemande.note_admin}</p>
                </div>
              )}

              {/* Actions rapides depuis la vue */}
              <div className="flex gap-2 pt-2 border-t">
                {viewDemande.statut !== 'approuve' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setViewDemande(null)
                      setActionDemande(viewDemande)
                      setActionType('approuve')
                      setNoteAdmin('')
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                )}
                {viewDemande.statut !== 'refuse' && (
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setViewDemande(null)
                      setActionDemande(viewDemande)
                      setActionType('refuse')
                      setNoteAdmin('')
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                )}
                <Button variant="ghost" className="ml-auto" onClick={() => setViewDemande(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog : Confirmation action ── */}
      <Dialog open={!!actionDemande} onOpenChange={(o) => !o && setActionDemande(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approuve' ? 'Approuver la candidature' : 'Refuser la candidature'}
            </DialogTitle>
          </DialogHeader>
          {actionDemande && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {actionType === 'approuve'
                  ? `Vous allez approuver la candidature de ${displayName(actionDemande.alumni)}.`
                  : `Vous allez refuser la candidature de ${displayName(actionDemande.alumni)}.`}
              </p>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Note {actionType === 'refuse' ? '(motif du refus)' : '(optionnelle)'}
                </label>
                <Textarea
                  rows={3}
                  placeholder={actionType === 'refuse' ? 'Expliquez le motif du refus...' : 'Ajouter un commentaire...'}
                  value={noteAdmin}
                  onChange={e => setNoteAdmin(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setActionDemande(null)} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={isSubmitting}
                  className={actionType === 'approuve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'}
                >
                  {isSubmitting
                    ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    : actionType === 'approuve'
                      ? <Check className="h-4 w-4 mr-2" />
                      : <X className="h-4 w-4 mr-2" />}
                  {actionType === 'approuve' ? "Confirmer l'approbation" : 'Confirmer le refus'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminWrapper>
  )
}
