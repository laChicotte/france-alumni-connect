"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { AlertCircle, Loader2, CheckCircle, ChevronDown, Check } from "lucide-react"
import type { DiplomeType, GenreType, NationaliteType, PlanRetourType, BourseType } from "@/types/database.types"
import { cn } from "@/lib/utils"
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js"

type SelectOption = { id: string; libelle: string }
type UiOption = { value: string; label: string; triggerLabel?: string }

const DIPLOME_OPTIONS: { value: DiplomeType; label: string }[] = [
  { value: "bts", label: "BTS" },
  { value: "dut", label: "DUT" },
  { value: "du", label: "DU" },
  { value: "de", label: "DE" },
  { value: "deug", label: "DEUG" },
  { value: "prepa", label: "Classe Prépa" },
  { value: "ecole_ingenieur", label: "École d'ingénieur" },
  { value: "ecole_specialisee", label: "École spécialisée" },
  { value: "licence_pro", label: "Licence professionnelle" },
  { value: "licence", label: "Licence" },
  { value: "master1", label: "Master 1" },
  { value: "master2", label: "Master 2" },
  { value: "doctorat", label: "Doctorat" },
  { value: "post_doctorat", label: "Post Doctorat" },
  { value: "autre", label: "Autre" },
]

const FORMATION_DOMAINE_OPTIONS = [
  "Administration",
  "Agriculture - agroalimentaire",
  "Architecture, urbanisme et aménagement du territoire",
  "Arts, culture, design et mode",
  "Banque/Economie/Gestion",
  "Biologie",
  "BTP/Géomètre Topo",
  "Chimie",
  "Communication et journalisme",
  "Droit",
  "Enseignement secondaire - Lycée Français",
  "Environnement et sciences de la terre",
  "Formation",
  "Industrie",
  "Informatique",
  "Langues et lettres",
  "Management, gestion, finances et commerce",
  "Mathématiques",
  "Physique",
  "Santé et professions sociales",
  "Sciences de l'éducation",
  "Sciences de l'ingénieur",
  "Sciences économiques et politiques",
  "Sciences humaines et sociales",
  "Social",
  "Sports",
  "Technique",
  "Tourisme, hôtellerie et restauration",
  "Transport et logistique",
  "Autre",
] as const

const DEFAULT_COUNTRY_CODE = "GN"

function countryCodeToFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

export default function InscriptionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [openSelectId, setOpenSelectId] = useState<string | null>(null)
  const [secteurs, setSecteurs] = useState<SelectOption[]>([])
  const [statuts, setStatuts] = useState<SelectOption[]>([])

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    prenom: "",
    nom: "",
    genre: "",
    nationalite: "",
    telephone_country_code: DEFAULT_COUNTRY_CODE,
    telephone_number: "",
    ville: "",
    universite: "",
    annee_promotion: "",
    diplome: "",
    formation_domaine: "",
    statut_professionnel_id: "",
    secteur_id: "",
    entreprise: "",
    poste_actuel: "",
    bio: "",
    linkedin_url: "",
    plan_retour: "",
    bourse: "",
    visible_annuaire: true,
    terms: false,
  })
  const [diplomeFile, setDiplomeFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const genreOptions: GenreType[] = ["Homme", "Femme"]
  const nationaliteOptions: NationaliteType[] = ["Guinéenne", "Franco-Guinéenne", "Guinéenne-Autre"]
  const planRetourOptions: PlanRetourType[] = ["Dans 2 ans", "Dans 5 ans", "Déjà en Guinée", "Autre"]
  const bourseOptions: BourseType[] = ["Non boursier", "Boursier Etat français", "Boursier Etat guinéen", "Boursier Etats français et guinéen"]
  const genreSelectOptions: UiOption[] = genreOptions.map((item) => ({ value: item, label: item }))
  const nationaliteSelectOptions: UiOption[] = nationaliteOptions.map((item) => ({ value: item, label: item }))
  const diplomeSelectOptions: UiOption[] = DIPLOME_OPTIONS.map((item) => ({ value: item.value, label: item.label }))
  const formationDomaineSelectOptions: UiOption[] = FORMATION_DOMAINE_OPTIONS.map((item) => ({ value: item, label: item }))
  const statutSelectOptions: UiOption[] = statuts.map((item) => ({ value: item.id, label: item.libelle }))
  const secteurSelectOptions: UiOption[] = secteurs.map((item) => ({ value: item.id, label: item.libelle }))
  const planRetourSelectOptions: UiOption[] = planRetourOptions.map((item) => ({ value: item, label: item }))
  const bourseSelectOptions: UiOption[] = bourseOptions.map((item) => ({ value: item, label: item }))
  const telephoneCountrySelectOptions: UiOption[] = useMemo(() => {
    const displayNames =
      typeof Intl !== "undefined" && typeof Intl.DisplayNames !== "undefined"
        ? new Intl.DisplayNames(["fr"], { type: "region" })
        : null
    return getCountries().map((country) => {
      const countryCode = country as CountryCode
      const countryName = displayNames?.of(countryCode) || countryCode
      const callingCode = getCountryCallingCode(countryCode)
      const flag = countryCodeToFlagEmoji(countryCode)
      return {
        value: countryCode,
        label: `${flag} ${countryName} (+${callingCode})`,
        triggerLabel: `${flag} +${callingCode}`,
      }
    })
  }, [])

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch("/api/inscription/options", { cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data) return
        setSecteurs(Array.isArray(data.secteurs) ? data.secteurs : [])
        setStatuts(Array.isArray(data.statuts_professionnels) ? data.statuts_professionnels : [])
      } catch (err) {
        console.error("Erreur chargement options inscription:", err)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    loadOptions()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const getSelectedLabel = (options: UiOption[], value: string, fallback = "Sélectionner", useTriggerLabel = false) => {
    if (!value) return fallback
    const opt = options.find((opt) => opt.value === value)
    if (!opt) return fallback
    return useTriggerLabel && opt.triggerLabel ? opt.triggerLabel : opt.label
  }

  const renderSearchableSelect = ({
    id,
    value,
    options,
    onSelect,
    placeholder,
    searchPlaceholder,
    emptyLabel,
    disabled = false,
    useTriggerLabel = false,
  }: {
    id: string
    value: string
    options: UiOption[]
    onSelect: (newValue: string) => void
    placeholder: string
    searchPlaceholder: string
    emptyLabel: string
    disabled?: boolean
    useTriggerLabel?: boolean
  }) => (
    <Popover
      open={openSelectId === id}
      onOpenChange={(open) => setOpenSelectId(open ? id : null)}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="truncate">{getSelectedLabel(options, value, placeholder, useTriggerLabel)}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-56">
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.value)
                    setOpenSelectId(null)
                  }}
                >
                  <Check className={cn("h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

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

    if (!formData.visible_annuaire) {
      setError("Vous devez accepter la publication de votre profil dans l'annuaire.")
      setIsLoading(false)
      return
    }

    const requiredTextFields: Array<keyof typeof formData> = [
      "email",
      "password",
      "confirmPassword",
      "prenom",
      "nom",
      "genre",
      "nationalite",
      "telephone_number",
      "ville",
      "universite",
      "annee_promotion",
      "diplome",
      "formation_domaine",
      "statut_professionnel_id",
      "secteur_id",
      "entreprise",
      "poste_actuel",
      "plan_retour",
      "bourse",
    ]
    const hasMissingRequired = requiredTextFields.some((key) => {
      const value = formData[key]
      return typeof value === "string" && value.trim() === ""
    })
    if (hasMissingRequired) {
      setError("Veuillez renseigner tous les champs obligatoires.")
      setIsLoading(false)
      return
    }

    if (!diplomeFile) {
      setError("Veuillez joindre votre diplôme.")
      setIsLoading(false)
      return
    }

    if (!photoFile) {
      setError("Veuillez ajouter une photo de profil.")
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
      const selectedCountryCode = (formData.telephone_country_code || DEFAULT_COUNTRY_CODE) as CountryCode
      const callingCode = getCountryCallingCode(selectedCountryCode)
      const composedTelephone = `+${callingCode} ${formData.telephone_number.trim()}`.trim()
      const body = new FormData()
      body.append('email', formData.email)
      body.append('password', formData.password)
      body.append('prenom', formData.prenom)
      body.append('nom', formData.nom)
      body.append('genre', formData.genre)
      body.append('nationalite', formData.nationalite)
      body.append('telephone', composedTelephone)
      body.append('ville', formData.ville)
      body.append('universite', formData.universite)
      body.append('annee_promotion', formData.annee_promotion)
      body.append('diplome', formData.diplome)
      body.append('formation_domaine', formData.formation_domaine)
      body.append('statut_professionnel_id', formData.statut_professionnel_id)
      body.append('secteur_id', formData.secteur_id)
      body.append('entreprise', formData.entreprise)
      body.append('poste_actuel', formData.poste_actuel)
      body.append('bio', formData.bio)
      body.append('linkedin_url', formData.linkedin_url)
      body.append('plan_retour', formData.plan_retour)
      body.append('bourse', formData.bourse)
      body.append('visible_annuaire', String(formData.visible_annuaire))
      body.append('diplome_file', diplomeFile)
      body.append('photo', photoFile)

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
      <Card className="w-full max-w-3xl">
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <h3 className="mb-3 border-b border-[#3558A2]/20 pb-1 text-sm font-semibold uppercase tracking-wide text-[#3558A2]">
                1. Identité et contact
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom <span className="text-red-500">*</span></Label>
                  <Input id="prenom" value={formData.prenom} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label>
                  <Input id="nom" value={formData.nom} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre <span className="text-red-500">*</span></Label>
                  {renderSearchableSelect({
                    id: "genre",
                    value: formData.genre,
                    options: genreSelectOptions,
                    onSelect: (newValue) => setFormData((prev) => ({ ...prev, genre: newValue })),
                    placeholder: "Sélectionner",
                    searchPlaceholder: "Rechercher un genre...",
                    emptyLabel: "Aucun genre trouvé.",
                  })}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalite">Nationalité <span className="text-red-500">*</span></Label>
                  {renderSearchableSelect({
                    id: "nationalite",
                    value: formData.nationalite,
                    options: nationaliteSelectOptions,
                    onSelect: (newValue) => setFormData((prev) => ({ ...prev, nationalite: newValue })),
                    placeholder: "Sélectionner",
                    searchPlaceholder: "Rechercher une nationalité...",
                    emptyLabel: "Aucune nationalité trouvée.",
                  })}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone <span className="text-red-500">*</span></Label>
                  <div className="flex items-center gap-2">
                    <div className="w-[110px] shrink-0">
                      {renderSearchableSelect({
                        id: "telephone_country_code",
                        value: formData.telephone_country_code,
                        options: telephoneCountrySelectOptions,
                        onSelect: (newValue) => setFormData((prev) => ({ ...prev, telephone_country_code: newValue })),
                        placeholder: "+224",
                        searchPlaceholder: "Rechercher un pays...",
                        emptyLabel: "Aucun pays trouvé.",
                        useTriggerLabel: true,
                      })}
                    </div>
                    <Input
                      id="telephone_number"
                      type="tel"
                      placeholder="Numéro local"
                      value={formData.telephone_number}
                      onChange={handleInputChange}
                      inputMode="tel"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville de résidence <span className="text-red-500">*</span></Label>
                  <Input id="ville" value={formData.ville} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 border-b border-[#3558A2]/20 pb-1 text-sm font-semibold uppercase tracking-wide text-[#3558A2]">
                2. Formation
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="universite">Université française <span className="text-red-500">*</span></Label>
                  <Input id="universite" placeholder="Ex: Université Paris-Saclay" value={formData.universite} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annee_promotion">Année d'obtention du diplôme <span className="text-red-500">*</span></Label>
                  <Input id="annee_promotion" type="number" min="1950" max={new Date().getFullYear()} value={formData.annee_promotion} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diplome">Niveau d'études <span className="text-red-500">*</span></Label>
                  {renderSearchableSelect({
                    id: "diplome",
                    value: formData.diplome,
                    options: diplomeSelectOptions,
                    onSelect: (newValue) => setFormData((prev) => ({ ...prev, diplome: newValue })),
                    placeholder: "Sélectionner",
                    searchPlaceholder: "Rechercher un diplôme...",
                    emptyLabel: "Aucun diplôme trouvé.",
                  })}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formation_domaine">Discipline <span className="text-red-500">*</span></Label>
                  {renderSearchableSelect({
                    id: "formation_domaine",
                    value: formData.formation_domaine,
                    options: formationDomaineSelectOptions,
                    onSelect: (newValue) => setFormData((prev) => ({ ...prev, formation_domaine: newValue })),
                    placeholder: "Sélectionner",
                    searchPlaceholder: "Rechercher un domaine...",
                    emptyLabel: "Aucun domaine trouvé.",
                  })}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bourse">Bourse <span className="text-red-500">*</span></Label>
                  {renderSearchableSelect({
                    id: "bourse",
                    value: formData.bourse,
                    options: bourseSelectOptions,
                    onSelect: (newValue) => setFormData((prev) => ({ ...prev, bourse: newValue })),
                    placeholder: "Sélectionner",
                    searchPlaceholder: "Rechercher...",
                    emptyLabel: "Aucune option trouvée.",
                  })}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 border-b border-[#3558A2]/20 pb-1 text-sm font-semibold uppercase tracking-wide text-[#3558A2]">
                3. Situation professionnelle
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="statut_professionnel_id">Statut professionnel <span className="text-red-500">*</span></Label>
                  {renderSearchableSelect({
                    id: "statut_professionnel_id",
                    value: formData.statut_professionnel_id,
                    options: statutSelectOptions,
                    onSelect: (newValue) => setFormData((prev) => ({ ...prev, statut_professionnel_id: newValue })),
                    placeholder: isLoadingOptions ? "Chargement..." : "Sélectionner",
                    searchPlaceholder: "Rechercher un statut...",
                    emptyLabel: "Aucun statut trouvé.",
                    disabled: isLoadingOptions,
                  })}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secteur_id">Secteur d'activité <span className="text-red-500">*</span></Label>
                  {renderSearchableSelect({
                    id: "secteur_id",
                    value: formData.secteur_id,
                    options: secteurSelectOptions,
                    onSelect: (newValue) => setFormData((prev) => ({ ...prev, secteur_id: newValue })),
                    placeholder: isLoadingOptions ? "Chargement..." : "Sélectionner",
                    searchPlaceholder: "Rechercher un secteur...",
                    emptyLabel: "Aucun secteur trouvé.",
                    disabled: isLoadingOptions,
                  })}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entreprise">Entreprise / organisation <span className="text-red-500">*</span></Label>
                  <Input
                    id="entreprise"
                    value={formData.entreprise}
                    onChange={handleInputChange}
                    placeholder="Mettre NAN si vous êtes en recherche d'emploi"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poste_actuel">Poste actuel <span className="text-red-500">*</span></Label>
                  <Input
                    id="poste_actuel"
                    value={formData.poste_actuel}
                    onChange={handleInputChange}
                    placeholder="Mettre NAN si vous êtes en recherche d'emploi"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="plan_retour">Plan de retour au pays<span className="text-red-500">*</span></Label>
                  {renderSearchableSelect({
                    id: "plan_retour",
                    value: formData.plan_retour,
                    options: planRetourSelectOptions,
                    onSelect: (newValue) => setFormData((prev) => ({ ...prev, plan_retour: newValue })),
                    placeholder: "Sélectionner",
                    searchPlaceholder: "Rechercher un plan de retour...",
                    emptyLabel: "Aucune option trouvée.",
                  })}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio / Présentation</Label>
                  <Textarea id="bio" value={formData.bio} onChange={handleTextAreaChange} rows={4} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="linkedin_url">Lien LinkedIn (optionnel)</Label>
                  <Input id="linkedin_url" type="url" placeholder="https://www.linkedin.com/in/..." value={formData.linkedin_url} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 border-b border-[#3558A2]/20 pb-1 text-sm font-semibold uppercase tracking-wide text-[#3558A2]">
                4. Compte et justificatifs
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Adresse email <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe <span className="text-red-500">*</span></Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe <span className="text-red-500">*</span></Label>
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo de profil (JPG, PNG, WEBP) <span className="text-red-500">*</span></Label>
                  <Input
                    id="photo"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    required
                    className="file:mr-4 file:rounded-md file:border-0 file:bg-[#3558A2] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#3558A2]/90"
                  />
                  <p className="text-xs text-muted-foreground">Max 3MB</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diplome_file">Diplôme (PDF, JPG, PNG) <span className="text-red-500">*</span></Label>
                  <Input
                    id="diplome_file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDiplomeFile(e.target.files?.[0] || null)}
                    required
                    className="file:mr-4 file:rounded-md file:border-0 file:bg-[#3558A2] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#3558A2]/90"
                  />
                  <p className="text-xs text-muted-foreground">Max 5MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-start space-x-2 pt-2">
                <Checkbox
                  id="visible_annuaire"
                  checked={formData.visible_annuaire}
                  onCheckedChange={(checked) => handleCheckboxChange("visible_annuaire", checked as boolean)}
                />
                <label htmlFor="visible_annuaire" className="text-sm text-muted-foreground leading-relaxed">
                  J&apos;accepte la publication de mon profil dans l&apos;annuaire <span className="text-red-500">*</span>
                </label>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => handleCheckboxChange('terms', checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                J&apos;accepte les{" "}
                <Link href="/conditions-utilisation" className="text-[#3558A2] hover:underline" target="_blank">
                  conditions d&apos;utilisation
                </Link>{" "}
                et les{" "}
                <Link href="/mentions-legales" className="text-[#3558A2] hover:underline" target="_blank">
                  mentions légales
                </Link> <span className="text-red-500">*</span>
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
