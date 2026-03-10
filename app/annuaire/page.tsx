"use client"

import Link from "next/link"
import { useEffect, useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { supabase } from "@/lib/supabase"
import { alumniMembers } from "@/lib/fake-data"
import { Search, GraduationCap, Briefcase, MapPin, Mail, Users, TrendingUp, Globe, Target, Loader2, ChevronDown, Check } from "lucide-react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis } from "recharts"
import type { AlumniProfile } from "@/types/database.types"
import { cn } from "@/lib/utils"

type AlumniWithJoins = AlumniProfile & {
  secteurs?: { libelle: string } | null
  statuts_professionnels?: { libelle: string } | null
  users?: { email: string } | null
}
type StatsItem = { name: string; value: number }
type AnnuaireStats = {
  totalAlumni: number
  sectorData: StatsItem[]
  genderData: StatsItem[]
  statusData: StatsItem[]
}

const PAGE_SIZE = 6
const DEFAULT_STATS: AnnuaireStats = {
  totalAlumni: 0,
  sectorData: [],
  genderData: [],
  statusData: [],
}


function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function AnnuairePage() {
  const router = useRouter()
  const [alumni, setAlumni] = useState<AlumniWithJoins[]>([])
  const [secteurs, setSecteurs] = useState<{ id: string; libelle: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSecteur, setFilterSecteur] = useState("")
  const [filterVille, setFilterVille] = useState("")
  const [isSecteurOpen, setIsSecteurOpen] = useState(false)
  const [isVilleOpen, setIsVilleOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState<AnnuaireStats>(DEFAULT_STATS)
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/annuaire/stats", { cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data) return

        setStats({
          totalAlumni: Number(data.totalAlumni) || 0,
          sectorData: Array.isArray(data.sectorData) ? data.sectorData : [],
          genderData: Array.isArray(data.genderData) ? data.genderData : [],
          statusData: Array.isArray(data.statusData) ? data.statusData : [],
        })
      } catch (error) {
        console.error("Erreur chargement stats annuaire:", error)
      }
    }

    loadStats()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const maxTravel = window.innerWidth >= 640 ? 550 : 300
      const translateY = -Math.min(y, maxTravel)
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${translateY}px)`
      }
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])


  // Charger les alumni: complet si connecté, aperçu limité si visiteur
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const connected = !!session
      setIsAuthenticated(connected)

      if (connected) {
        const { data: secteursData } = await supabase
          .from("secteurs")
          .select("id, libelle")
          .order("ordre")

        if (secteursData) setSecteurs(secteursData)

        const { data: alumniData, error } = await supabase
          .from("alumni_profiles")
          .select(`
            *,
            secteurs(libelle),
            statuts_professionnels(libelle),
            users(email)
          `)
          .eq("visible_annuaire", true)

        if (error) {
          console.error("Erreur chargement annuaire:", error)
          setLoading(false)
          return
        }

        setAlumni(shuffle((alumniData as AlumniWithJoins[]) || []))
      } else {
        const res = await fetch("/api/annuaire/public-preview", { cache: "no-store" })
        const json = await res.json().catch(() => ({ profiles: [] }))
        setAlumni((json?.profiles as AlumniWithJoins[]) || [])
      }

      setLoading(false)
    }

    loadData()
  }, [])

  // Villes distinctes (depuis les données)
  const villes = useMemo(() => {
    const set = new Set(alumni.map((a) => a.ville).filter(Boolean))
    return ["", ...Array.from(set).sort()]
  }, [alumni])
  const selectedSecteurLabel = useMemo(() => {
    if (!filterSecteur) return "secteur"
    return secteurs.find((s) => s.id === filterSecteur)?.libelle || "secteur"
  }, [filterSecteur, secteurs])
  const selectedVilleLabel = filterVille || "ville"

  // Alumni filtrés (visiteur: aperçu fixe sans exploration)
  const filteredAlumni = useMemo(() => {
    if (!isAuthenticated) return alumni

    return alumni.filter((a) => {
      const fullName = `${a.prenom} ${a.nom}`.toLowerCase()
      const search = searchQuery.toLowerCase()
      const matchSearch =
        !search ||
        fullName.includes(search) ||
        a.universite?.toLowerCase().includes(search) ||
        a.entreprise?.toLowerCase().includes(search) ||
        a.formation_domaine?.toLowerCase().includes(search)
      const matchSecteur = !filterSecteur || a.secteur_id === filterSecteur
      const matchVille = !filterVille || a.ville === filterVille
      return matchSearch && matchSecteur && matchVille
    })
  }, [alumni, searchQuery, filterSecteur, filterVille, isAuthenticated])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterSecteur, filterVille, isAuthenticated])

  const totalPages = isAuthenticated ? Math.max(1, Math.ceil(filteredAlumni.length / PAGE_SIZE)) : 1
  const displayedAlumni = useMemo(() => {
    if (!isAuthenticated) return filteredAlumni
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredAlumni.slice(start, start + PAGE_SIZE)
  }, [filteredAlumni, isAuthenticated, currentPage])

  // Base historique (comme avant) - utilisée en fallback si les stats DB ne sont pas disponibles
  const staticStats = useMemo(() => {
    const totalAlumni = alumniMembers.length
    const sectorCount: Record<string, number> = {}
    alumniMembers.forEach((member) => {
      sectorCount[member.sector] = (sectorCount[member.sector] || 0) + 1
    })
    const sectorData = Object.entries(sectorCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
    const genderData = [
      { name: "Homme", value: Math.floor(totalAlumni * 0.54) },
      { name: "Femme", value: Math.floor(totalAlumni * 0.46) },
    ]
    const statusData = [
      { name: "Employé", value: Math.floor(totalAlumni * 0.65) },
      { name: "Étudiant", value: Math.floor(totalAlumni * 0.20) },
      { name: "Entrepreneur", value: Math.floor(totalAlumni * 0.10) },
      { name: "Sans emploi", value: Math.floor(totalAlumni * 0.05) },
    ]
    return {
      totalAlumni,
      sectorData,
      genderData,
      statusData,
    }
  }, [])

  const effectiveStats = useMemo(() => ({
    totalAlumni: stats.totalAlumni > 0 ? stats.totalAlumni : staticStats.totalAlumni,
    sectorData: stats.sectorData.length > 0 ? stats.sectorData : staticStats.sectorData,
    genderData: stats.genderData.length > 0 ? stats.genderData : staticStats.genderData,
    statusData: stats.statusData.length > 0 ? stats.statusData : staticStats.statusData,
  }), [stats, staticStats])

  const genderSummary = useMemo(() => {
    const getValue = (label: string) => effectiveStats.genderData.find((item) => item.name === label)?.value || 0
    return {
      homme: getValue("Homme"),
      femme: getValue("Femme"),
      autre: getValue("Autre"),
    }
  }, [effectiveStats.genderData])

  const COLORS = ["#3558A2", "#FCD116", "#6B7280", "#9CA3AF", "#ea292c", "#3558A2", "#FCD116", "#6B7280"]

  return (
    <div className="min-h-screen">
      {/* Hero image */}
      <section ref={heroRef} className="fixed left-0 top-20 z-10 h-[300px] w-full overflow-hidden will-change-transform sm:h-[550px]">
        <img src="/annuaire/annuaire.jpg" alt="Annuaire" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-end px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
            annuaire
          </h1>
        </div>
      </section>

      {/* Spacer pour que le contenu remonte seulement après sortie du hero */}
      <div className="h-[380px] sm:h-[630px]" />

      {/* Filters */}
      <section className="border-b bg-white">
        <div className="mx-auto w-full max-w-[86rem] px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            {isAuthenticated ? (
              <div className="flex w-full flex-wrap items-center gap-3">
                <div className="flex w-full items-center rounded-full bg-[#8fb5d0] p-1.5 sm:w-auto">
                  <div className="flex min-w-0 flex-1 items-center gap-2 px-4 sm:w-80">
                    <Search className="h-4 w-4 shrink-0 text-white/80" />
                    <input
                      type="text"
                      placeholder="Nom, université, entreprise..."
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/75 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="h-9 rounded-full bg-[#3558A2] px-5 text-sm font-semibold text-white hover:bg-[#2d4b8c]">
                    rechercher
                  </Button>
                </div>

                <Popover open={isSecteurOpen} onOpenChange={setIsSecteurOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[#8fb5d0] bg-white px-5 text-sm font-semibold text-[#3558A2]"
                    >
                      {selectedSecteurLabel}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[280px] p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher un secteur..." />
                      <CommandList className="max-h-56">
                        <CommandEmpty>Aucun secteur trouvé.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setFilterSecteur("")
                              setIsSecteurOpen(false)
                            }}
                          >
                            <Check className={cn("h-4 w-4", !filterSecteur ? "opacity-100" : "opacity-0")} />
                            secteur
                          </CommandItem>
                          {secteurs.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={s.libelle}
                              onSelect={() => {
                                setFilterSecteur(s.id)
                                setIsSecteurOpen(false)
                              }}
                            >
                              <Check className={cn("h-4 w-4", filterSecteur === s.id ? "opacity-100" : "opacity-0")} />
                              {s.libelle}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Popover open={isVilleOpen} onOpenChange={setIsVilleOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[#8fb5d0] bg-white px-5 text-sm font-semibold text-[#3558A2]"
                    >
                      {selectedVilleLabel}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[280px] p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher une ville..." />
                      <CommandList className="max-h-56">
                        <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setFilterVille("")
                              setIsVilleOpen(false)
                            }}
                          >
                            <Check className={cn("h-4 w-4", !filterVille ? "opacity-100" : "opacity-0")} />
                            ville
                          </CommandItem>
                          {villes.filter(Boolean).map((ville) => (
                            <CommandItem
                              key={ville}
                              value={ville}
                              onSelect={() => {
                                setFilterVille(ville)
                                setIsVilleOpen(false)
                              }}
                            >
                              <Check className={cn("h-4 w-4", filterVille === ville ? "opacity-100" : "opacity-0")} />
                              {ville}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="text-sm font-semibold sm:text-base">Recherche & Filtres</div>
            )}
            <div className="ml-2 hidden h-[2px] w-16 bg-[#f48988] sm:block md:w-28" aria-hidden="true" />
          </div>

          {isAuthenticated ? null : (
            <div className="rounded-md border border-input bg-white p-3 text-sm text-muted-foreground">
              Aperçu public de l&apos;annuaire: profils affichés aléatoirement. Connectez-vous pour accéder à la
              recherche, aux filtres et à l&apos;intégralité des profils.
            </div>
          )}
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-[#3558A2]" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between sm:mb-8">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {isAuthenticated ? filteredAlumni.length : displayedAlumni.length}
                  </span>{" "}
                  alumni
                  trouvés
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedAlumni.map((member) => (
                  <Card key={member.id} className="h-full hover:shadow-lg transition-shadow group">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-1">
                          <img
                            src={member.photo_url || "/placeholder.svg"}
                            alt={`${member.prenom} ${member.nom}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-serif text-xl font-bold mb-1 group-hover:text-[#3558A2] transition-colors">
                          {member.prenom} {member.nom}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {member.entreprise || member.poste_actuel || "—"}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {member.formation_domaine} - {member.universite} ({member.annee_promotion})
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isAuthenticated ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-1 bg-transparent hover:bg-[#3558A2] hover:text-white"
                              >
                                Voir le profil
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="font-serif text-2xl font-bold text-left">
                                  {member.prenom} {member.nom}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="flex items-start gap-6">
                                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                    <img
                                      src={member.photo_url || "/placeholder.svg"}
                                      alt={`${member.prenom} ${member.nom}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-serif text-xl font-bold text-[#3558A2] mb-2">
                                      {member.poste_actuel || "—"}
                                    </h3>
                                    <p className="text-lg text-muted-foreground mb-4">
                                      {member.entreprise || "—"}
                                    </p>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <GraduationCap className="h-4 w-4 text-[#3558A2]" />
                                        <span>
                                          <strong>{member.formation_domaine}</strong> - {member.universite} (
                                          {member.annee_promotion})
                                        </span>
                                      </div>
                                      {member.secteurs?.libelle && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <Briefcase className="h-4 w-4 text-[#3558A2]" />
                                          <span>{member.secteurs.libelle}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-[#3558A2]" />
                                        <span>{member.ville}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {member.bio && (
                                  <div>
                                    <h4 className="font-semibold mb-2">À propos</h4>
                                    <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent hover:bg-[#3558A2] hover:text-white"
                            onClick={() => setShowAuthPrompt(true)}
                          >
                            Voir le profil
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          className="bg-transparent hover:bg-[#3558A2] hover:text-white"
                          onClick={() => {
                            if (!isAuthenticated || !member.users?.email) {
                              setShowAuthPrompt(true)
                              return
                            }
                            window.location.href = `mailto:${member.users.email}`
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredAlumni.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-12">
                  Aucun alumni ne correspond à vos critères.
                </p>
              )}

              {isAuthenticated && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="hidden sm:inline">Précédent</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="hidden sm:inline">Suivant</span>
                    <span className="sm:hidden">Next</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Accès réservé</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Inscrivez-vous ou connectez-vous pour consulter les profils complets et contacter les alumni.
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button className="flex-1 bg-[#3558A2] hover:bg-[#3558A2]/90" onClick={() => router.push("/connexion")}>
              Se connecter
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => router.push("/inscription")}>
              Créer un compte
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nos Alumni en Chiffres - données réelles avec fallback historique */}
      <section className="py-4 bg-[#ffe8e4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-5">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Nos Alumni en Chiffres</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les statistiques de notre communauté d&apos;alumni guinéens
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{effectiveStats.totalAlumni.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Membres actifs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Répartition par Genre</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{genderSummary.homme}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Homme: {genderSummary.homme} | Femme: {genderSummary.femme} | Autre: {genderSummary.autre}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan de Retour</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">684</div>
                <p className="text-xs text-muted-foreground mt-1">Alumni prévoyant de retourner</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Objectif 2025</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">684</div>
                <p className="text-xs text-muted-foreground mt-1">01/01/2025</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>Statut Professionnel</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 overflow-hidden">
                <ChartContainer
                  config={{ value: { label: "Nombre" } }}
                  className="h-[200px] sm:h-[240px] md:h-[300px] w-full"
                >
                  <BarChart data={effectiveStats.statusData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#3558A2" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>Répartition par Genre</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 overflow-hidden">
                <ChartContainer
                  config={{ value: { label: "Nombre" } }}
                  className="h-[200px] sm:h-[240px] md:h-[300px] w-full"
                >
                  <PieChart>
                    <Pie
                      data={effectiveStats.genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {effectiveStats.genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Top Secteurs d&apos;Activité</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 overflow-hidden">
              <ChartContainer
                config={{ value: { label: "Nombre" } }}
                className="h-[200px] sm:h-[240px] md:h-[300px] w-full"
              >
                <BarChart data={effectiveStats.sectorData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3558A2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
              Vous n&apos;êtes pas encore inscrit ?
            </h2>
            <p className="text-lg mb-2 max-w-2xl mx-auto">
              Rejoignez l&apos;annuaire pour être visible auprès de la communauté et développer votre
              réseau professionnel.
            </p>
            <Button size="lg" className="bg-[#ea292c] hover:bg-[#f48988]/90 font-semibold" asChild>
              <Link href="/inscription">Rejoindre l&apos;annuaire</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
