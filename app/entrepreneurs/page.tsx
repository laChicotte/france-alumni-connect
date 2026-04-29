'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { Search, MapPin, Users, Globe, Loader2, Building2, ChevronLeft, ArrowRight, ExternalLink } from 'lucide-react'

type EntreprisePublique = {
  id: string
  denomination_sociale: string
  nom_commercial: string | null
  secteur_activite: string
  description_produits: string
  stade_developpement: string
  effectif: string
  localisation_siege: string
  site_web: string | null
  logo_url: string | null
  presentation_publication: string | null
  impact_principal: string[]
  description_impact: string | null
  photos_urls: string[]
  created_at: string
  users: { nom: string | null; prenom: string | null } | null
}

const STADE_LABELS: Record<string, string> = {
  lancement: 'Lancement',
  activite_reguliere: 'Activité régulière',
  croissance: 'Croissance',
  expansion: 'Expansion',
}

const STADES = ['lancement', 'activite_reguliere', 'croissance', 'expansion']

export default function EntreprisesPage() {
  const router = useRouter()
  const [entreprises, setEntreprises] = useState<EntreprisePublique[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStade, setFilterStade] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<EntreprisePublique | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })
  }, [])

  const fetchEntreprises = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      if (filterStade) params.set('stade', filterStade)
      const res = await fetch(`/api/entrepreneurs/public?${params}`)
      const data = await res.json()
      setEntreprises(data.entreprises || [])
      setTotal(data.total || 0)
      setTotalPages(data.pages || 1)
    } catch {
      setEntreprises([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchEntreprises() }, [page, filterStade])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchEntreprises()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-[#3558A2]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3558A2] to-[#1a2d5a] opacity-90" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center">
          <Building2 className="h-12 w-12 mb-3 opacity-80" />
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2">Entreprises de nos alumni</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl">
            Découvrez les entreprises portées par des membres du réseau France Alumni Guinée
          </p>
          <p className="text-white/60 text-sm mt-1">{total > 0 ? `${total} entreprise${total > 1 ? 's' : ''} référencée${total > 1 ? 's' : ''}` : ''}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button variant="outline" onClick={() => router.push('/annuaire')} className="w-fit">
            <ChevronLeft className="h-4 w-4 mr-1" /> Retour à l'annuaire
          </Button>
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une entreprise..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" className="bg-[#3558A2] hover:bg-[#2a4580]">Rechercher</Button>
          </form>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3558A2]"
            value={filterStade}
            onChange={e => { setFilterStade(e.target.value); setPage(1) }}
          >
            <option value="">Tous les stades</option>
            {STADES.map(s => <option key={s} value={s}>{STADE_LABELS[s]}</option>)}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#3558A2]" />
          </div>
        ) : entreprises.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Aucune entreprise trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entreprises.map(e => (
              <Card key={e.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => setSelected(e)}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-lg bg-[#3558A2]/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {e.logo_url
                        ? <img src={e.logo_url} alt={e.denomination_sociale} className="w-full h-full object-contain p-1" />
                        : <span className="text-2xl font-bold text-[#3558A2]">{e.denomination_sociale.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#3558A2] transition-colors line-clamp-1">
                        {e.denomination_sociale}
                      </h3>
                      {e.users && (
                        <p className="text-xs text-gray-500">{e.users.prenom} {e.users.nom}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="secondary" className="text-xs">{e.secteur_activite}</Badge>
                    <Badge variant="outline" className="text-xs text-[#3558A2] border-[#3558A2]/30">
                      {STADE_LABELS[e.stade_developpement] || e.stade_developpement}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {e.presentation_publication || e.description_produits}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{e.localisation_siege}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />{e.effectif}
                    </span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-3 group-hover:bg-[#3558A2] group-hover:text-white group-hover:border-[#3558A2] transition-colors">
                    Voir l'entreprise <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</Button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</Button>
          </div>
        )}

        {/* CTA inscription si connecté alumni */}
        {isAuthenticated && (
          <div className="mt-12 bg-[#3558A2]/5 border border-[#3558A2]/20 rounded-xl p-6 text-center">
            <Building2 className="h-10 w-10 mx-auto mb-3 text-[#3558A2] opacity-60" />
            <h3 className="font-bold text-gray-900 mb-1">Vous êtes entrepreneur ?</h3>
            <p className="text-sm text-gray-600 mb-4">Référencez votre entreprise sur le réseau France Alumni Guinée.</p>
            <Button asChild className="bg-[#3558A2] hover:bg-[#2a4580]">
              <Link href="/entrepreneur/inscription">Référencer mon entreprise</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Dialog: Détail entreprise */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selected.logo_url && (
                  <img src={selected.logo_url} alt="" className="w-10 h-10 object-contain rounded" />
                )}
                {selected.denomination_sociale}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {selected.users && (
                <p className="text-gray-500">par <span className="font-medium text-gray-700">{selected.users.prenom} {selected.users.nom}</span></p>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selected.secteur_activite}</Badge>
                <Badge variant="outline" className="text-[#3558A2] border-[#3558A2]/30">
                  {STADE_LABELS[selected.stade_developpement] || selected.stade_developpement}
                </Badge>
                <Badge variant="outline" className="text-gray-500">
                  <Users className="h-3 w-3 mr-1" />{selected.effectif} employé{parseInt(selected.effectif) > 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />{selected.localisation_siege}
                </Badge>
              </div>

              {selected.presentation_publication && (
                <p className="text-gray-700 italic">"{selected.presentation_publication}"</p>
              )}

              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Activité</h4>
                <p className="text-gray-600">{selected.description_produits}</p>
              </div>

              {selected.impact_principal.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Impact</h4>
                  <div className="flex flex-wrap gap-1">
                    {selected.impact_principal.map(i => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}
                  </div>
                  {selected.description_impact && <p className="mt-2 text-gray-600">{selected.description_impact}</p>}
                </div>
              )}

              {selected.photos_urls.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Photos</h4>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selected.photos_urls.map((url, i) => (
                      <img key={i} src={url} alt={`Photo ${i + 1}`} className="h-28 w-40 object-cover rounded shrink-0" />
                    ))}
                  </div>
                </div>
              )}

              {selected.site_web && (
                <a href={selected.site_web} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#3558A2] hover:underline">
                  <Globe className="h-4 w-4" />{selected.site_web} <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <div className="flex gap-2 pt-2 border-t">
                {!isAuthenticated && (
                  <Button asChild className="bg-[#3558A2] hover:bg-[#2a4580]">
                    <Link href="/connexion">Se connecter pour en savoir plus</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelected(null)} className="ml-auto">Fermer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
