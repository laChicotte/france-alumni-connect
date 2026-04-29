'use client'

import { useEffect, useState } from 'react'
import { AdminWrapper } from '@/components/admin/admin-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import {
  CheckCircle2, AlertCircle, Eye, Check, X, Trash2, Search,
  Building2, Loader2, FileText, ExternalLink, Clock, MapPin,
} from 'lucide-react'
import type { EntrepriseAlumni } from '@/types/database.types'

type EntrepriseWithUser = EntrepriseAlumni & {
  users: { id: string; nom: string | null; prenom: string | null; email: string } | null
}

type Feedback = { type: 'success' | 'error'; message: string }

const STADE_LABELS: Record<string, string> = {
  lancement: 'Lancement',
  activite_reguliere: 'Activité régulière',
  croissance: 'Croissance',
  expansion: 'Expansion',
}

function StatutBadge({ statut }: { statut: string }) {
  if (statut === 'valide') return <Badge className="bg-green-100 text-green-700 border-0">Validée</Badge>
  if (statut === 'en_attente') return <Badge className="bg-amber-100 text-amber-700 border-0">En attente</Badge>
  return <Badge className="bg-red-100 text-red-700 border-0">Rejetée</Badge>
}

export default function AdminEntreprisesPage() {
  const [entreprises, setEntreprises] = useState<EntrepriseWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ en_attente: 0, valide: 0, rejete: 0 })

  const [selectedEntreprise, setSelectedEntreprise] = useState<EntrepriseWithUser | null>(null)
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)

  const [actionEntreprise, setActionEntreprise] = useState<EntrepriseWithUser | null>(null)
  const [actionType, setActionType] = useState<'valide' | 'rejete' | null>(null)
  const [noteAdmin, setNoteAdmin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  const fetchEntreprises = async () => {
    setIsLoading(true)
    try {
      const token = await getToken()
      if (!token) return
      const params = new URLSearchParams({ page: String(page) })
      if (filterStatut !== 'all') params.set('statut', filterStatut)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/entrepreneurs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) { setFeedback({ type: 'error', message: data.error || 'Erreur de chargement' }); return }
      setEntreprises(data.entreprises || [])
      setTotalPages(data.pages || 1)
    } catch {
      setFeedback({ type: 'error', message: 'Erreur de connexion' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = await getToken()
      if (!token) return
      const headers = { Authorization: `Bearer ${token}` }
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/admin/entrepreneurs?statut=en_attente&page=1', { headers }),
        fetch('/api/admin/entrepreneurs?statut=valide&page=1', { headers }),
        fetch('/api/admin/entrepreneurs?statut=rejete&page=1', { headers }),
      ])
      const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()])
      setStats({ en_attente: d1.total || 0, valide: d2.total || 0, rejete: d3.total || 0 })
    } catch {}
  }

  useEffect(() => { fetchEntreprises() }, [page, filterStatut])
  useEffect(() => { fetchStats() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchEntreprises()
  }

  const handleViewDocument = async (docPath: string) => {
    setIsLoadingDoc(true)
    const { data } = await supabase.storage.from('entreprises-docs').createSignedUrl(docPath, 3600)
    setIsLoadingDoc(false)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    } else {
      setFeedback({ type: 'error', message: 'Impossible d\'accéder au document' })
    }
  }

  const handleAction = async () => {
    if (!actionEntreprise || !actionType) return
    setIsSubmitting(true)
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch(`/api/admin/entrepreneurs/${actionEntreprise.id}/statut`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: actionType, notes_admin: noteAdmin.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Erreur' })
      } else {
        setFeedback({
          type: 'success',
          message: actionType === 'valide' ? 'Entreprise validée avec succès.' : 'Entreprise rejetée.',
        })
        setActionEntreprise(null)
        setActionType(null)
        setNoteAdmin('')
        await Promise.all([fetchEntreprises(), fetchStats()])
      }
    } catch {
      setFeedback({ type: 'error', message: 'Erreur de connexion' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette entreprise définitivement ?')) return
    const { error } = await (supabase.from('entreprises_alumni') as any).delete().eq('id', id)
    if (error) {
      setFeedback({ type: 'error', message: error.message })
    } else {
      setFeedback({ type: 'success', message: 'Entreprise supprimée.' })
      await Promise.all([fetchEntreprises(), fetchStats()])
    }
  }

  const openAction = (e: EntrepriseWithUser, type: 'valide' | 'rejete') => {
    setSelectedEntreprise(null)
    setActionEntreprise(e)
    setActionType(type)
    setNoteAdmin('')
  }

  return (
    <AdminWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Entreprises Alumni</h1>
            <p className="text-sm text-gray-500 mt-1">Gérez les demandes de référencement des entreprises</p>
          </div>
          <Badge variant="outline" className="text-[#3558A2] border-[#3558A2]">Gestion admin entreprises</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-amber-700">{stats.en_attente}</div>
              <div className="text-sm text-amber-600">En attente</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-green-700">{stats.valide}</div>
              <div className="text-sm text-green-600">Validées</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-red-700">{stats.rejete}</div>
              <div className="text-sm text-red-600">Rejetées</div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback */}
        {feedback && (
          <Alert
            variant={feedback.type === 'error' ? 'destructive' : 'default'}
            className={feedback.type === 'success' ? 'border-green-500 bg-green-50' : ''}
          >
            {feedback.type === 'success'
              ? <CheckCircle2 className="h-4 w-4 text-green-600" />
              : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className={feedback.type === 'success' ? 'text-green-700' : ''}>
              {feedback.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom d'entreprise..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" className="bg-[#3558A2] hover:bg-[#2a4580]">Rechercher</Button>
          </form>
          <Select value={filterStatut} onValueChange={v => { setFilterStatut(v); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="valide">Validées</SelectItem>
              <SelectItem value="rejete">Rejetées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#3558A2]" />
          </div>
        ) : entreprises.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucune entreprise trouvée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entreprises.map(e => (
              <Card key={e.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 rounded-lg shrink-0">
                      {e.logo_url && <AvatarImage src={e.logo_url} alt={e.denomination_sociale} className="object-contain" />}
                      <AvatarFallback className="rounded-lg bg-[#3558A2]/10 text-[#3558A2] font-bold text-xl">
                        {e.denomination_sociale.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{e.denomination_sociale}</h3>
                        <StatutBadge statut={e.statut} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {e.users ? `${e.users.prenom} ${e.users.nom}` : '—'} · {e.secteur_activite}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                        <MapPin className="h-3 w-3 inline" />{e.localisation_siege}
                        <Clock className="h-3 w-3 inline ml-1" />{new Date(e.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setSelectedEntreprise(e)} title="Voir le détail">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {e.statut !== 'valide' && (
                        <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50" onClick={() => openAction(e, 'valide')} title="Valider">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {e.statut !== 'rejete' && (
                        <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => openAction(e, 'rejete')} title="Rejeter">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-red-300 text-red-400 hover:bg-red-50" onClick={() => handleDelete(e.id)} title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</Button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</Button>
          </div>
        )}
      </div>

      {/* Dialog: Détail */}
      {selectedEntreprise && (
        <Dialog open onOpenChange={() => setSelectedEntreprise(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedEntreprise.logo_url && (
                  <img src={selectedEntreprise.logo_url} alt="" className="w-10 h-10 object-contain rounded" />
                )}
                {selectedEntreprise.denomination_sociale}
                <StatutBadge statut={selectedEntreprise.statut} />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2 text-sm">
              <section>
                <h4 className="font-semibold text-[#3558A2] mb-2 text-base">Identification de l'alumni</h4>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                  <div><span className="font-medium">Nom :</span> {selectedEntreprise.users ? `${selectedEntreprise.users.prenom} ${selectedEntreprise.users.nom}` : '—'}</div>
                  <div><span className="font-medium">Email compte :</span> {selectedEntreprise.users?.email || '—'}</div>
                  <div><span className="font-medium">Fonction :</span> {selectedEntreprise.fonction}</div>
                  <div><span className="font-medium">Email pro :</span> {selectedEntreprise.email_pro}</div>
                  <div><span className="font-medium">Téléphone pro :</span> {selectedEntreprise.telephone_pro}</div>
                </div>
              </section>

              <section>
                <h4 className="font-semibold text-[#3558A2] mb-2 text-base">Informations juridiques</h4>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                  <div><span className="font-medium">Dénomination :</span> {selectedEntreprise.denomination_sociale}</div>
                  {selectedEntreprise.nom_commercial && <div><span className="font-medium">Nom commercial :</span> {selectedEntreprise.nom_commercial}</div>}
                  <div><span className="font-medium">Forme juridique :</span> {selectedEntreprise.forme_juridique}</div>
                  <div><span className="font-medium">Date de création :</span> {selectedEntreprise.date_creation}</div>
                  <div><span className="font-medium">RCCM / NIF :</span> {selectedEntreprise.numero_rccm_nif}</div>
                  <div><span className="font-medium">Siège social :</span> {selectedEntreprise.localisation_siege}</div>
                </div>
                {selectedEntreprise.document_justificatif_url && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleViewDocument(selectedEntreprise.document_justificatif_url!)} disabled={isLoadingDoc}>
                    {isLoadingDoc ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                    Voir le document justificatif <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                )}
              </section>

              <section>
                <h4 className="font-semibold text-[#3558A2] mb-2 text-base">Profil de l'entreprise</h4>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4 [&>div]:min-w-0 [&>div]:break-words">
                  <div><span className="font-medium">Secteur :</span> {selectedEntreprise.secteur_activite}</div>
                  <div><span className="font-medium">Stade :</span> {STADE_LABELS[selectedEntreprise.stade_developpement] || selectedEntreprise.stade_developpement}</div>
                  <div><span className="font-medium">Effectif :</span> {selectedEntreprise.effectif}</div>
                  {selectedEntreprise.chiffre_affaires && <div><span className="font-medium">CA approx. :</span> {selectedEntreprise.chiffre_affaires}</div>}
                  {selectedEntreprise.site_web && <div className="col-span-2"><span className="font-medium">Site web :</span> <a href={selectedEntreprise.site_web} target="_blank" rel="noreferrer" className="text-[#3558A2] hover:underline">{selectedEntreprise.site_web}</a></div>}
                </div>
                {selectedEntreprise.types_clients.length > 0 && <p className="mt-1"><span className="font-medium">Clients :</span> {selectedEntreprise.types_clients.join(', ')}</p>}
                <p className="mt-2 text-gray-700">{selectedEntreprise.description_produits}</p>
              </section>

              {selectedEntreprise.besoins.length > 0 && (
                <section>
                  <h4 className="font-semibold text-[#3558A2] mb-2 text-base">Besoins</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntreprise.besoins.map(b => <Badge key={b} variant="outline" className="text-xs">{b}</Badge>)}
                  </div>
                  {selectedEntreprise.besoins_autre && <p className="mt-1 text-gray-600">Autre : {selectedEntreprise.besoins_autre}</p>}
                </section>
              )}

              <section>
                <h4 className="font-semibold text-[#3558A2] mb-2 text-base">Collaboration</h4>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                  <div>Recherche associé : <span className={selectedEntreprise.recherche_associe ? 'text-green-600 font-medium' : 'text-gray-400'}>{selectedEntreprise.recherche_associe ? `Oui${selectedEntreprise.domaine_associe ? ` (${selectedEntreprise.domaine_associe})` : ''}` : 'Non'}</span></div>
                  <div>Propose emploi/stage : <span className={selectedEntreprise.propose_emploi ? 'text-green-600 font-medium' : 'text-gray-400'}>{selectedEntreprise.propose_emploi ? 'Oui' : 'Non'}</span></div>
                  <div>Disponible événement : <span className={selectedEntreprise.disponible_evenement ? 'text-green-600 font-medium' : 'text-gray-400'}>{selectedEntreprise.disponible_evenement ? 'Oui' : 'Non'}</span></div>
                  <div>Souhaite devenir mentor : <span className={selectedEntreprise.souhaite_mentor ? 'text-green-600 font-medium' : 'text-gray-400'}>{selectedEntreprise.souhaite_mentor ? 'Oui' : 'Non'}</span></div>
                </div>
              </section>

              <section>
                <h4 className="font-semibold text-[#3558A2] mb-2 text-base">Impact & Valorisation</h4>
                {selectedEntreprise.impact_principal.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedEntreprise.impact_principal.map(i => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}
                  </div>
                )}
                {selectedEntreprise.description_impact && <p className="text-gray-700 mb-1">{selectedEntreprise.description_impact}</p>}
                <p>Mise en avant sur le site : <span className={selectedEntreprise.mise_en_avant ? 'text-green-600 font-medium' : 'text-gray-400'}>{selectedEntreprise.mise_en_avant ? 'Oui' : 'Non'}</span></p>
                {selectedEntreprise.presentation_publication && <p className="mt-1 italic text-gray-600">"{selectedEntreprise.presentation_publication}"</p>}
              </section>

              {selectedEntreprise.notes_admin && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="font-semibold text-amber-700 mb-1">Note admin</p>
                  <p className="text-amber-800">{selectedEntreprise.notes_admin}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                {selectedEntreprise.statut !== 'valide' && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openAction(selectedEntreprise, 'valide')}>
                    <Check className="h-4 w-4 mr-2" /> Valider
                  </Button>
                )}
                {selectedEntreprise.statut !== 'rejete' && (
                  <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => openAction(selectedEntreprise, 'rejete')}>
                    <X className="h-4 w-4 mr-2" /> Rejeter
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedEntreprise(null)} className="ml-auto">Fermer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog: Confirmer action */}
      {actionEntreprise && actionType && (
        <Dialog open onOpenChange={() => { setActionEntreprise(null); setActionType(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === 'valide' ? "Valider l'entreprise" : "Rejeter l'entreprise"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {actionType === 'valide'
                  ? `Voulez-vous valider "${actionEntreprise.denomination_sociale}" ? Elle sera visible publiquement.`
                  : `Voulez-vous rejeter "${actionEntreprise.denomination_sociale}" ?`}
              </p>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Note admin {actionType === 'rejete' ? '(motif du refus, recommandé)' : '(optionnel)'}
                </label>
                <Textarea
                  className="mt-1" rows={3}
                  placeholder={actionType === 'rejete' ? 'Expliquez la raison du refus...' : 'Note optionnelle...'}
                  value={noteAdmin}
                  onChange={e => setNoteAdmin(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setActionEntreprise(null); setActionType(null) }}>Annuler</Button>
                <Button
                  disabled={isSubmitting}
                  className={actionType === 'valide' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                  onClick={handleAction}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {actionType === 'valide' ? 'Confirmer la validation' : 'Confirmer le rejet'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminWrapper>
  )
}
