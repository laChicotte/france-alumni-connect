"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { supabase } from "@/lib/supabase"
import { alumniMembers } from "@/lib/fake-data"
import { Search, GraduationCap, Briefcase, MapPin, Mail, Users, Loader2, ChevronDown, Check } from "lucide-react"
import type { AlumniProfile } from "@/types/database.types"
import { cn } from "@/lib/utils"

function SemiCircleGauge({ pct, label }: { pct: number; label: string }) {
  const cx = 50, cy = 50, r = 38, SEGS = 12
  const filled = Math.round((pct / 100) * SEGS)
  const pt = (t: number) => ({ x: cx - r * Math.cos(t * Math.PI), y: cy - r * Math.sin(t * Math.PI) })
  const bg0 = pt(0), bg1 = pt(1)
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="138" height="84" viewBox="0 0 100 60">
        <path d={`M ${bg0.x} ${bg0.y} A ${r} ${r} 0 0 1 ${bg1.x} ${bg1.y}`} fill="none" stroke="#ffffff" strokeWidth="10" />
        {Array.from({ length: SEGS }, (_, i) => {
          if (i >= filled) return null
          const gap = 0.07
          const s = pt((i + gap) / SEGS), e = pt((i + 1 - gap) / SEGS)
          return (
            <path key={i} d={`M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`}
              fill="none" stroke="#3558A2" strokeWidth="10" />
          )
        })}
        <text x="50" y="47" textAnchor="middle" fontSize="18" fontWeight="800" fill="#ffffff">{pct}%</text>
      </svg>
      <span className="text-base sm:text-lg text-center text-[#ffffff] font-semibold leading-tight max-w-[200px]">{label}</span>
    </div>
  )
}

function PersonIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="36" viewBox="0 0 22 36" aria-hidden="true">
      <circle cx="11" cy="6" r="5" fill={color} />
      <path d="M 11 11 L 11 24 M 4 16 L 18 16 M 11 24 L 5 34 M 11 24 L 17 34"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

type AlumniWithJoins = AlumniProfile & {
  secteurs?: { libelle: string } | null
  statuts_professionnels?: { libelle: string } | null
  users?: { email: string } | null
}
type StatsItem = { name: string; value: number }
type AnnuaireStats = {
  totalAlumni: number
  sectorData: StatsItem[]
  statusData: StatsItem[]
  planRetourCount: number
  dejaEnGuineeCount: number
}

const PAGE_SIZE = 6
const DEFAULT_STATS: AnnuaireStats = {
  totalAlumni: 0,
  sectorData: [],
  statusData: [],
  planRetourCount: 0,
  dejaEnGuineeCount: 0,
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

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/annuaire/stats", { cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data) return

        setStats({
          totalAlumni: Number(data.totalAlumni) || 0,
          sectorData: Array.isArray(data.sectorData) ? data.sectorData : [],
          statusData: Array.isArray(data.statusData) ? data.statusData : [],
          planRetourCount: Number(data.planRetourCount) || 0,
          dejaEnGuineeCount: Number(data.dejaEnGuineeCount) || 0,
        })
      } catch (error) {
        console.error("Erreur chargement stats annuaire:", error)
      }
    }

    loadStats()
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
  const filtersDisabled = !isAuthenticated

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
    const statusData = [
      { name: "Employé", value: Math.floor(totalAlumni * 0.65) },
      { name: "Étudiant", value: Math.floor(totalAlumni * 0.20) },
      { name: "Entrepreneur", value: Math.floor(totalAlumni * 0.10) },
      { name: "Sans emploi", value: Math.floor(totalAlumni * 0.05) },
    ]
    return {
      totalAlumni,
      sectorData,
      statusData,
    }
  }, [])

  const effectiveStats = useMemo(() => ({
    totalAlumni: stats.totalAlumni > 0 ? stats.totalAlumni : staticStats.totalAlumni,
    sectorData: stats.sectorData.length > 0 ? stats.sectorData : staticStats.sectorData,
    statusData: stats.statusData.length > 0 ? stats.statusData : staticStats.statusData,
  }), [stats, staticStats])

  const communityStats = useMemo(() => {
    const total = effectiveStats.totalAlumni || 1
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const statusPct = (keyword: string) => {
      const found = effectiveStats.statusData.find(d => norm(d.name).includes(keyword))
      return found ? Math.round((found.value / total) * 100) : 0
    }
    return {
      entrepreneurPct: statusPct("entrepreneur"),
      salariePct: statusPct("salari"),
      recherchePct: statusPct("recherche"),
      dejaEnGuineeRatio: Math.min(10, Math.round((stats.dejaEnGuineeCount / total) * 10)),
    }
  }, [effectiveStats, stats.dejaEnGuineeCount])

  const sectorCloudWords = useMemo(() => {
    const items = effectiveStats.sectorData.slice(0, 9)
    if (items.length === 0) return []

    const values = items.map((item) => item.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const spread = max - min || 1

    // Positions manuelles pour un rendu "éparpillé"
    const anchors = [
      { top: 4, left: 58 },
      { top: 18, left: 34 },
      { top: 22, left: 70 },
      { top: 38, left: 16 },
      { top: 42, left: 52 },
      { top: 50, left: 74 },
      { top: 64, left: 30 },
      { top: 72, left: 58 },
      { top: 12, left: 10 },
    ]

    return items.map((item, index) => {
      const weight = (item.value - min) / spread
      const fontSize = 14 + weight * 26
      const anchor = anchors[index % anchors.length]
      return {
        ...item,
        top: anchor.top,
        left: anchor.left,
        fontSize,
        weight,
      }
    })
  }, [effectiveStats.sectorData])

  return (
    <div className="min-h-screen">
      {/* Hero image */}
      <section className="relative mx-4 mt-4 h-[320px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[420px] lg:mx-8 lg:h-[400px]">
        <Image src="/annuaire/annuaire2.jpg" alt="Annuaire" fill className="object-cover hero-zoom" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-10 px-10 sm:pb-14 sm:px-20 lg:pb-16 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl lg:text-4xl">
            annuaire
          </h1>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-4">
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
                      disabled={filtersDisabled}
                    />
                  </div>
                  <Button
                    className="h-9 rounded-full bg-[#3558A2] px-5 text-sm font-semibold text-white hover:bg-[#2d4b8c]"
                    disabled={filtersDisabled}
                  >
                    rechercher
                  </Button>
                </div>

                <Popover
                  open={isSecteurOpen}
                  onOpenChange={(open) => {
                    if (!filtersDisabled) setIsSecteurOpen(open)
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={filtersDisabled}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border border-[#8fb5d0] bg-white px-5 text-sm font-semibold text-[#3558A2]",
                        filtersDisabled && "cursor-not-allowed opacity-60"
                      )}
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

                <Popover
                  open={isVilleOpen}
                  onOpenChange={(open) => {
                    if (!filtersDisabled) setIsVilleOpen(open)
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={filtersDisabled}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border border-[#8fb5d0] bg-white px-5 text-sm font-semibold text-[#3558A2]",
                        filtersDisabled && "cursor-not-allowed opacity-60"
                      )}
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
          </div>
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-4 mb-13">
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

      {/* Notre Communauté */}
      <section className="py-16 bg-[#da281c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#ffffff] text-center mb-12">
            notre communauté
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-6 items-center justify-items-center">

            {/* Gauche : demi-cercles + nuage de mots */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex justify-center gap-4">
                <SemiCircleGauge pct={communityStats.entrepreneurPct} label="entrepreneurs" />
                <SemiCircleGauge pct={communityStats.salariePct} label="salariés" />
                <SemiCircleGauge pct={communityStats.recherchePct} label="en recherche d'emploi" />
              </div>
              <div className="lg:mt-18">
                <span className="inline-block bg-[#3558A2] text-[#ffffff] px-3 py-1 rounded text-sm font-bold mb-3">
                  secteurs d&apos;activité
                </span>
                <div className="relative h-52 sm:h-56 w-full max-w-[360px] sm:max-w-[420px] mx-auto">
                  {sectorCloudWords.map((sector) => (
                    <span
                      key={sector.name}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-[#bcd5f9] whitespace-nowrap leading-none"
                      style={{
                        top: `${sector.top}%`,
                        left: `${sector.left}%`,
                        fontSize: `${sector.fontSize}px`,
                        fontWeight: sector.weight > 0.7 ? 900 : sector.weight > 0.4 ? 700 : 600,
                      }}
                    >
                      {sector.name.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Centre : grand cercle alumni */}
            <div className="flex items-center justify-center pt-2">
              <div className="w-60 h-60 rounded-full bg-[#8ba4c9] flex flex-col items-center justify-center shadow-md">
                <span className="text-[4.4rem] font-extrabold text-white leading-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]">
                  {effectiveStats.totalAlumni.toLocaleString("fr-FR")}
                </span>
                <span className="text-white font-semibold text-xl mt-1">Alumni</span>
              </div>
            </div>

            {/* Droite : bonhommes + stats retour */}
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <div className="mb-3 grid grid-cols-5 gap-x-1.5 gap-y-2 w-max mx-auto">
                  {Array.from({ length: 10 }, (_, i) => (
                    <PersonIcon key={i} color={i < communityStats.dejaEnGuineeRatio ? "#ffffff" : "#8ba4c9"} />
                  ))}
                </div>
                <p className="font-bold text-[#ffffff] text-lg leading-snug">
                  {stats.dejaEnGuineeCount.toLocaleString("fr-FR")}/{effectiveStats.totalAlumni.toLocaleString("fr-FR")} Alumni
                  <br />
                  <span className="text-[#ffffff]">déjà de retour en Guinée</span>
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <span className="text-7xl font-black text-[#ffffff] leading-none">{stats.planRetourCount}</span>
                  <p className="text-2xl font-semibold text-[#bcd5f9] mt-1">envisagent le <br />retour</p>
                </div>
                <Image
                  src="/annuaire/fleche2.png"
                  alt="Flèche retour"
                  width={86}
                  height={104}
                  className="shrink-0 h-auto w-[86px] object-contain"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button
            size="lg"
            className="h-14 rounded-full bg-[#ea292c] px-10 text-lg font-semibold hover:bg-[#f48988]/90"
            asChild
          >
            <Link href="/inscription">Rejoignez l&apos;annuaire</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
