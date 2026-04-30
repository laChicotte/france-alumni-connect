'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Loader2, Upload, X as XIcon, Check } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type FormData = {
  // Étape 1
  fonction: string
  // Étape 2
  denomination_sociale: string
  nom_commercial: string
  forme_juridique: string
  date_creation: string
  numero_rccm_nif: string
  localisation_siege: string
  // Étape 3
  secteur_activite: string
  description_produits: string
  stade_developpement: string
  effectif: string
  chiffre_affaires: string
  types_clients: string[]
  site_web: string
  // Étape 4
  besoins: string[]
  besoins_autre: string
  // Étape 5
  recherche_associe: boolean
  domaine_associe: string
  propose_emploi: boolean
  disponible_evenement: boolean
  souhaite_mentor: boolean
  // Étape 6
  impact_principal: string[]
  description_impact: string
  mise_en_avant: boolean
  presentation_publication: string
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const FONCTIONS = ['Fondateur', 'Cofondateur', 'Gérant', 'Directeur', 'Associé']
const FORMES_JURIDIQUES = ['SARL', 'SA', 'Entreprise individuelle', 'Coopérative', 'SNC', 'SAS', 'GIE']
const STADES = [
  { value: 'lancement', label: 'Lancement' },
  { value: 'activite_reguliere', label: 'Activité régulière' },
  { value: 'croissance', label: 'Croissance' },
  { value: 'expansion', label: 'Expansion' },
]
const TYPES_CLIENTS = ['Particuliers', 'Entreprises', 'Institutions', 'ONG', 'Secteur public', 'Autre']
const BESOINS_OPTIONS = [
  'Recherche de financement',
  'Conseil juridique ou fiscal',
  'Mentorat entrepreneurial',
  'Mise en réseau institutionnelle',
  'Partenariats commerciaux',
  'Recrutement',
  'Communication et visibilité',
  'Digitalisation',
  'Développement à l\'international',
]
const IMPACT_OPTIONS = [
  'Création d\'emplois',
  'Innovation',
  'Développement local',
  'Inclusion',
  'Formation',
  'Environnement',
  'Santé',
  'Éducation',
  'Numérique',
]

const STEPS = [
  'Identification',
  'Profil',
  'Besoins',
  'Collaboration',
  'Impact',
  'Déclaration',
]

const EMPTY_FORM: FormData = {
  fonction: '',
  denomination_sociale: '', nom_commercial: '', forme_juridique: '',
  date_creation: '', numero_rccm_nif: '', localisation_siege: '',
  secteur_activite: '', description_produits: '', stade_developpement: '',
  effectif: '', chiffre_affaires: '', types_clients: [], site_web: '',
  besoins: [], besoins_autre: '',
  recherche_associe: false, domaine_associe: '', propose_emploi: false,
  disponible_evenement: false, souhaite_mentor: false,
  impact_principal: [], description_impact: '', mise_en_avant: false,
  presentation_publication: '',
}

// ─── Composants helpers ───────────────────────────────────────────────────────

function CheckboxGroup({
  options, selected, onChange,
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt} type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            selected.includes(opt)
              ? 'bg-[#3558A2] text-white border-[#3558A2]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#3558A2]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function RadioGroup({
  options, value, onChange,
}: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value} type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
            value === opt.value
              ? 'bg-[#3558A2] text-white border-[#3558A2]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#3558A2]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function BooleanField({
  label, value, onChange, helper,
}: { label: string; value: boolean; onChange: (v: boolean) => void; helper?: string }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {helper && <p className="text-xs text-gray-500 mt-0.5">{helper}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-[#3558A2]' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function EntrepreneurInscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [declarations, setDeclarations] = useState([false, false, false])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)

  const STORAGE_KEY = `form_entrepreneur_${userId}`

  // Auth check + restore draft
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/connexion'); return }

      const { data: profile } = await (supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single() as any) as { data: { role: string } | null }

      if (!profile || profile.role !== 'alumni') { router.push('/'); return }
      setUserId(session.user.id)

      // Restore draft from localStorage
      const draft = localStorage.getItem(`form_entrepreneur_${session.user.id}`)
      if (draft) {
        try { setForm(JSON.parse(draft)) } catch {}
      }

      // Check if already has enterprise → prefill
      const { data } = await (supabase.from('entreprises_alumni') as any)
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (data) {
        setForm({
          fonction: data.fonction || '',
          denomination_sociale: data.denomination_sociale || '',
          nom_commercial: data.nom_commercial || '',
          forme_juridique: data.forme_juridique || '',
          date_creation: data.date_creation || '',
          numero_rccm_nif: data.numero_rccm_nif || '',
          localisation_siege: data.localisation_siege || '',
          secteur_activite: data.secteur_activite || '',
          description_produits: data.description_produits || '',
          stade_developpement: data.stade_developpement || '',
          effectif: data.effectif || '',
          chiffre_affaires: data.chiffre_affaires || '',
          types_clients: data.types_clients || [],
          site_web: data.site_web || '',
          besoins: data.besoins || [],
          besoins_autre: data.besoins_autre || '',
          recherche_associe: data.recherche_associe || false,
          domaine_associe: data.domaine_associe || '',
          propose_emploi: data.propose_emploi || false,
          disponible_evenement: data.disponible_evenement || false,
          souhaite_mentor: data.souhaite_mentor || false,
          impact_principal: data.impact_principal || [],
          description_impact: data.description_impact || '',
          mise_en_avant: data.mise_en_avant || false,
          presentation_publication: data.presentation_publication || '',
        })
        if (data.logo_url) setLogoPreview(data.logo_url)
      }
      setIsLoading(false)
    }
    check()
  }, [])

  const set = (key: keyof FormData, value: unknown) => {
    const next = { ...form, [key]: value }
    setForm(next)
    if (userId) localStorage.setItem(`form_entrepreneur_${userId}`, JSON.stringify(next))
  }

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.fonction) return 'Veuillez indiquer votre fonction dans l\'entreprise.'
      if (!form.denomination_sociale) return 'La dénomination sociale est requise.'
      if (!form.forme_juridique) return 'La forme juridique est requise.'
      if (!form.date_creation) return 'La date de création est requise.'
      if (!form.numero_rccm_nif) return 'Le numéro RCCM / NIF est requis.'
      if (!form.localisation_siege) return 'La localisation du siège est requise.'
    }
    if (step === 2) {
      if (!form.secteur_activite) return 'Le secteur d\'activité est requis.'
      if (!form.description_produits) return 'La description est requise.'
      if (!form.stade_developpement) return 'Le stade de développement est requis.'
      if (!form.effectif) return 'L\'effectif est requis.'
    }
    if (step === 6) {
      if (!declarations.every(Boolean)) return 'Veuillez cocher les 3 déclarations pour soumettre.'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError(null)
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrev = () => {
    setError(null)
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { setError('Le logo ne doit pas dépasser 3MB.'); return }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Le document ne doit pas dépasser 5MB.'); return }
    setDocFile(file)
  }

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photoFiles.length > 5) { setError('Maximum 5 photos.'); return }
    setPhotoFiles(prev => [...prev, ...files])
    setPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removePhoto = (i: number) => {
    setPhotoFiles(prev => prev.filter((_, idx) => idx !== i))
    setPhotoPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setIsSubmitting(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('Session expirée. Reconnectez-vous.'); return }

      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v))
        else fd.append(k, String(v))
      })
      if (logoFile) fd.append('logo', logoFile)
      if (docFile) fd.append('document_justificatif', docFile)
      photoFiles.forEach(f => fd.append('photos', f))

      const res = await fetch('/api/entrepreneur/soumettre', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur lors de la soumission.'); return }

      if (userId) localStorage.removeItem(`form_entrepreneur_${userId}`)
      router.push('/entrepreneur/mon-profil?submitted=1')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3558A2] font-serif">Référencer mon entreprise</h1>
          <p className="text-sm text-gray-500 mt-1">Complétez les 6 étapes pour soumettre votre dossier</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((label, i) => {
            const num = i + 1
            const done = num < step
            const active = num === step
            return (
              <div key={num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    done ? 'bg-[#3558A2] border-[#3558A2] text-white'
                    : active ? 'bg-white border-[#3558A2] text-[#3558A2]'
                    : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {done ? <Check className="h-4 w-4" /> : num}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block whitespace-nowrap ${active ? 'text-[#3558A2] font-medium' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 sm:w-12 mx-1 transition-colors ${done ? 'bg-[#3558A2]' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Card étape */}
        <Card className="shadow-sm">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              Étape {step} — {STEPS[step - 1]}
            </h2>

            {/* ── Étape 1: Identification ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Fonction dans l'entreprise *</Label>
                  <RadioGroup
                    options={FONCTIONS.map(f => ({ value: f, label: f }))}
                    value={form.fonction}
                    onChange={v => set('fonction', v)}
                  />
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700">Informations juridiques</p>
                </div>
                <div>
                  <Label htmlFor="denomination_sociale" className="mb-2 block">Dénomination sociale *</Label>
                  <Input id="denomination_sociale" value={form.denomination_sociale} onChange={e => set('denomination_sociale', e.target.value)} placeholder="Nom officiel de l'entreprise" />
                </div>
                <div>
                  <Label htmlFor="nom_commercial" className="mb-2 block">Nom commercial <span className="text-gray-400 font-normal">(si différent)</span></Label>
                  <Input id="nom_commercial" value={form.nom_commercial} onChange={e => set('nom_commercial', e.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">Forme juridique *</Label>
                  <RadioGroup
                    options={FORMES_JURIDIQUES.map(f => ({ value: f, label: f }))}
                    value={form.forme_juridique}
                    onChange={v => set('forme_juridique', v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_creation" className="mb-2 block">Date de création *</Label>
                    <Input id="date_creation" type="date" value={form.date_creation} onChange={e => set('date_creation', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="numero_rccm_nif" className="mb-2 block">RCCM / NIF *</Label>
                    <Input id="numero_rccm_nif" value={form.numero_rccm_nif} onChange={e => set('numero_rccm_nif', e.target.value)} placeholder="Ex : RCCM GN.TCC.2025.14390" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="localisation_siege" className="mb-2 block">Localisation du siège social *</Label>
                  <Input id="localisation_siege" value={form.localisation_siege} onChange={e => set('localisation_siege', e.target.value)} placeholder="Ville, adresse" />
                </div>
                <div>
                  <Label className="mb-2 block">Document justificatif <span className="text-gray-400 font-normal">(RCCM, NIF ou acte officiel — PDF/image, max 5MB)</span></Label>
                  <input type="file" ref={docInputRef} accept=".pdf,image/*" className="hidden" onChange={handleDocChange} />
                  <Button type="button" variant="outline" onClick={() => docInputRef.current?.click()} className="mt-1 w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {docFile ? docFile.name : 'Choisir un document'}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Étape 2: Profil ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="secteur_activite" className="mb-2 block">Secteur d'activité *</Label>
                  <Input id="secteur_activite" value={form.secteur_activite} onChange={e => set('secteur_activite', e.target.value)} placeholder="Ex: Technologie, Agriculture, Santé..." />
                </div>
                <div>
                  <Label htmlFor="description_produits" className="mb-2 block">Description des produits / services *</Label>
                  <Textarea id="description_produits" rows={3} value={form.description_produits} onChange={e => set('description_produits', e.target.value)} placeholder="Décrivez ce que propose votre entreprise..." />
                </div>
                <div>
                  <Label className="mb-2 block">Stade de développement *</Label>
                  <RadioGroup options={STADES} value={form.stade_developpement} onChange={v => set('stade_developpement', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="effectif" className="mb-2 block">Effectif actuel *</Label>
                    <Input id="effectif" value={form.effectif} onChange={e => set('effectif', e.target.value)} placeholder="Ex: 5, 10-20..." />
                  </div>
                  <div>
                    <Label htmlFor="chiffre_affaires" className="mb-2 block">CA annuel approx. <span className="text-gray-400 font-normal">(optionnel)</span></Label>
                    <Input id="chiffre_affaires" value={form.chiffre_affaires} onChange={e => set('chiffre_affaires', e.target.value)} placeholder="Ex: 50 millions GNF" />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Principaux clients / bénéficiaires</Label>
                  <CheckboxGroup options={TYPES_CLIENTS} selected={form.types_clients} onChange={v => set('types_clients', v)} />
                </div>
                <div>
                  <Label htmlFor="site_web" className="mb-2 block">Site web / réseaux sociaux <span className="text-gray-400 font-normal">(optionnel)</span></Label>
                  <Input id="site_web" type="url" value={form.site_web} onChange={e => set('site_web', e.target.value)} placeholder="https://..." />
                </div>
              </div>
            )}

            {/* ── Étape 3: Besoins ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-base">Quels sont vos besoins prioritaires ?</Label>
                  <p className="text-sm text-gray-500 mb-3">Sélectionnez tout ce qui s'applique</p>
                  <CheckboxGroup options={BESOINS_OPTIONS} selected={form.besoins} onChange={v => set('besoins', v)} />
                </div>
                <div>
                  <Label htmlFor="besoins_autre" className="mb-2 block">Autre besoin <span className="text-gray-400 font-normal">(préciser)</span></Label>
                  <Input id="besoins_autre" value={form.besoins_autre} onChange={e => set('besoins_autre', e.target.value)} placeholder="Précisez si besoin spécifique..." />
                </div>
              </div>
            )}

            {/* ── Étape 4: Collaboration ── */}
            {step === 4 && (
              <div className="space-y-3">
                <BooleanField
                  label="Recherchez-vous un associé, partenaire technique ou commercial au sein du réseau ?"
                  value={form.recherche_associe}
                  onChange={v => set('recherche_associe', v)}
                />
                {form.recherche_associe && (
                  <div className="ml-4">
                    <Label htmlFor="domaine_associe" className="mb-2 block">Dans quel domaine ?</Label>
                    <Input id="domaine_associe" value={form.domaine_associe} onChange={e => set('domaine_associe', e.target.value)} placeholder="Ex: Développement commercial, Finance..." />
                  </div>
                )}
                <BooleanField
                  label="Pouvez-vous proposer des opportunités de stage ou d'emploi à des jeunes alumni ?"
                  value={form.propose_emploi}
                  onChange={v => set('propose_emploi', v)}
                />
                <BooleanField
                  label="Seriez-vous disponible pour partager votre expérience lors d'un événement France Alumni Guinée ?"
                  value={form.disponible_evenement}
                  onChange={v => set('disponible_evenement', v)}
                />
                <BooleanField
                  label="Souhaitez-vous devenir mentor pour un jeune entrepreneur ou porteur de projet ?"
                  value={form.souhaite_mentor}
                  onChange={v => set('souhaite_mentor', v)}
                />
              </div>
            )}

            {/* ── Étape 5: Impact & Valorisation ── */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-base">Impact principal de votre entreprise</Label>
                  <p className="text-sm text-gray-500 mb-3">Sélectionnez tout ce qui correspond</p>
                  <CheckboxGroup options={IMPACT_OPTIONS} selected={form.impact_principal} onChange={v => set('impact_principal', v)} />
                </div>
                <div>
                  <Label htmlFor="description_impact" className="mb-2 block">Décrivez brièvement l'impact <span className="text-gray-400 font-normal">(optionnel)</span></Label>
                  <Textarea id="description_impact" rows={2} value={form.description_impact} onChange={e => set('description_impact', e.target.value)} placeholder="En quelques phrases..." />
                </div>
                <BooleanField
                  label="Souhaitez-vous que votre entreprise soit mise en avant sur France Alumni Connect ?"
                  value={form.mise_en_avant}
                  onChange={v => set('mise_en_avant', v)}
                />
                {form.mise_en_avant && (
                  <div>
                    <Label htmlFor="presentation_publication" className="mb-2 block">Présentation courte pour publication</Label>
                    <Textarea id="presentation_publication" rows={2} value={form.presentation_publication} onChange={e => set('presentation_publication', e.target.value)} placeholder="Accroche de présentation publique..." />
                  </div>
                )}
                <div>
                  <Label className="mb-2 block">Logo de l'entreprise <span className="text-gray-400 font-normal">(JPG/PNG/SVG, max 3MB)</span></Label>
                  <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <div className="flex items-center gap-3 mt-1">
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded border" />
                    )}
                    <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {logoFile ? logoFile.name : logoPreview ? 'Changer le logo' : 'Choisir un logo'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Photos / supports <span className="text-gray-400 font-normal">(optionnel, max 5 photos)</span></Label>
                  <input type="file" ref={photosInputRef} accept="image/*" multiple className="hidden" onChange={handlePhotosChange} />
                  {photoPreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-1 mb-2">
                      {photoPreviews.map((url, i) => (
                        <div key={i} className="relative">
                          <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                          <button type="button" onClick={() => removePhoto(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <XIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {photoFiles.length < 5 && (
                    <Button type="button" variant="outline" onClick={() => photosInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Ajouter des photos
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ── Étape 6: Déclaration ── */}
            {step === 6 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">En soumettant ce formulaire, vous confirmez :</p>
                {[
                  'Je certifie l\'exactitude des informations fournies et l\'authenticité des documents joints.',
                  'J\'autorise l\'Institut français de Guinée à vérifier ces informations auprès des autorités compétentes si nécessaire.',
                  'J\'autorise France Alumni Guinée à utiliser les informations publiques fournies pour valoriser mon entreprise sur ses supports de communication, sous réserve de validation préalable.',
                ].map((text, i) => (
                  <label key={i} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        declarations[i] ? 'bg-[#3558A2] border-[#3558A2]' : 'border-gray-300'
                      }`}
                      onClick={() => setDeclarations(prev => prev.map((v, idx) => idx === i ? !v : v))}
                    >
                      {declarations[i] && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">{text}</span>
                  </label>
                ))}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  Votre dossier sera examiné par l'équipe France Alumni Guinée. Vous serez notifié de la décision par email.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={step === 1 ? () => router.push('/entrepreneur/mon-profil') : handlePrev}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 1 ? 'Annuler' : 'Précédent'}
          </Button>
          {step < 6 ? (
            <Button onClick={handleNext} className="bg-[#3558A2] hover:bg-[#2a4580]">
              Suivant <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#3558A2] hover:bg-[#2a4580]">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Soumettre mon dossier
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
