'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2, Loader2, MapPin, Users, Globe, Pencil,
  Clock, CheckCircle2, XCircle, ChevronLeft, ExternalLink,
  FileText, AlertCircle
} from 'lucide-react'

type Entreprise = {
  id: string
  denomination_sociale: string
  nom_commercial: string | null
  forme_juridique: string
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
  statut: 'en_attente' | 'valide' | 'rejete'
  notes_admin: string | null
  created_at: string
  updated_at: string
}

const STADE_LABELS: Record<string, string> = {
  lancement: 'Lancement',
  activite_reguliere: 'Activité régulière',
  croissance: 'Croissance',
  expansion: 'Expansion',
}

const STATUT_CONFIG = {
  en_attente: {
    label: 'En attente de validation',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  valide: {
    label: 'Validée et publiée',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-800',
  },
  rejete: {
    label: 'Non publiée',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-800',
  },
}

export default function MonProfilEntrepreneurPage() {
  const router = useRouter()
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadEntreprise()
  }, [])

  const loadEntreprise = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/connexion')
        return
      }
      setUserId(session.user.id)

      const { data, error: dbError } = await supabase
        .from('entreprises_alumni')
        .select(`
          id, denomination_sociale, nom_commercial, forme_juridique,
          secteur_activite, description_produits, stade_developpement,
          effectif, localisation_siege, site_web, logo_url,
          presentation_publication, impact_principal, description_impact,
          photos_urls, statut, notes_admin, created_at, updated_at
        `)
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (dbError) throw dbError
      setEntreprise(data)
    } catch {
      setError('Impossible de charger les données de votre entreprise.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3558A2]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadEntreprise} className="bg-[#3558A2] hover:bg-[#2a4580]">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (!entreprise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm border p-10">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-[#3558A2] opacity-40" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Vous n'avez pas encore d'entreprise référencée</h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Rejoignez les entrepreneurs du réseau France Alumni Guinée en référençant votre entreprise.
            </p>
            <Button asChild className="bg-[#3558A2] hover:bg-[#2a4580]">
              <Link href="/entrepreneur/inscription">
                <Building2 className="h-4 w-4 mr-2" />
                Référencer mon entreprise
              </Link>
            </Button>
            <div className="mt-4">
              <Button variant="ghost" onClick={() => router.push('/annuaire')} className="text-gray-400">
                <ChevronLeft className="h-4 w-4 mr-1" /> Retour à l'annuaire
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statutCfg = STATUT_CONFIG[entreprise.statut]
  const StatutIcon = statutCfg.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/annuaire')} className="text-gray-500">
            <ChevronLeft className="h-4 w-4 mr-1" /> Annuaire
          </Button>
          <Button asChild className="bg-[#3558A2] hover:bg-[#2a4580]">
            <Link href="/entrepreneur/inscription">
              <Pencil className="h-4 w-4 mr-2" /> Modifier mon entreprise
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Statut banner */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${statutCfg.bg}`}>
          <StatutIcon className={`h-5 w-5 mt-0.5 shrink-0 ${statutCfg.color}`} />
          <div className="flex-1">
            <p className={`font-semibold ${statutCfg.color}`}>{statutCfg.label}</p>
            {entreprise.statut === 'en_attente' && (
              <p className="text-sm text-yellow-700 mt-0.5">
                Votre dossier est en cours d'examen par nos équipes. Vous serez notifié par email.
              </p>
            )}
            {entreprise.statut === 'valide' && (
              <p className="text-sm text-green-700 mt-0.5">
                Votre entreprise est visible publiquement sur le réseau France Alumni Guinée.{' '}
                <Link href="/entrepreneurs" className="underline font-medium">Voir la page publique</Link>
              </p>
            )}
            {entreprise.statut === 'rejete' && entreprise.notes_admin && (
              <div className="mt-2">
                <p className="text-sm text-red-700 font-medium">Motif :</p>
                <p className="text-sm text-red-600 mt-0.5 whitespace-pre-line">{entreprise.notes_admin}</p>
                <p className="text-sm text-red-700 mt-2">
                  Vous pouvez modifier votre dossier et le soumettre à nouveau.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Identité */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#3558A2]/10 flex items-center justify-center shrink-0 overflow-hidden">
                {entreprise.logo_url
                  ? <img src={entreprise.logo_url} alt={entreprise.denomination_sociale} className="w-full h-full object-contain p-2" />
                  : <span className="text-3xl font-bold text-[#3558A2]">{entreprise.denomination_sociale.charAt(0)}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">{entreprise.denomination_sociale}</h1>
                {entreprise.nom_commercial && entreprise.nom_commercial !== entreprise.denomination_sociale && (
                  <p className="text-gray-500 text-sm">"{entreprise.nom_commercial}"</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">{entreprise.secteur_activite}</Badge>
                  <Badge variant="outline" className="text-[#3558A2] border-[#3558A2]/30">
                    {STADE_LABELS[entreprise.stade_developpement] || entreprise.stade_developpement}
                  </Badge>
                  <Badge variant="outline" className="text-gray-500">
                    {entreprise.forme_juridique.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />{entreprise.localisation_siege}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />{entreprise.effectif} employé{parseInt(entreprise.effectif) > 1 ? 's' : ''}
                  </span>
                  {entreprise.site_web && (
                    <a href={entreprise.site_web} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-[#3558A2] hover:underline">
                      <Globe className="h-3.5 w-3.5" />
                      {entreprise.site_web.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activité & produits/services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">{entreprise.description_produits}</p>
          </CardContent>
        </Card>

        {/* Présentation publique */}
        {entreprise.presentation_publication && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Présentation publique</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm italic">"{entreprise.presentation_publication}"</p>
            </CardContent>
          </Card>
        )}

        {/* Impact */}
        {entreprise.impact_principal.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {entreprise.impact_principal.map(i => (
                  <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                ))}
              </div>
              {entreprise.description_impact && (
                <p className="text-gray-600 text-sm">{entreprise.description_impact}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {entreprise.photos_urls.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {entreprise.photos_urls.map((url, i) => (
                  <img key={i} src={url} alt={`Photo ${i + 1}`}
                    className="h-32 w-48 object-cover rounded-lg shrink-0" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Métadonnées */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>Soumis le {new Date(entreprise.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>Dernière modification le {new Date(entreprise.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-8">
          <Button variant="outline" asChild>
            <Link href="/entrepreneurs">Voir la liste publique</Link>
          </Button>
          <Button asChild className="bg-[#3558A2] hover:bg-[#2a4580]">
            <Link href="/entrepreneur/inscription">
              <Pencil className="h-4 w-4 mr-2" /> Modifier mon entreprise
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
