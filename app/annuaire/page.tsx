"use client"

import Link from "next/link"
import { useEffect, useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { supabase } from "@/lib/supabase"
import { alumniMembers } from "@/lib/fake-data"
import { Search, Filter, GraduationCap, Briefcase, MapPin, Mail, Users, TrendingUp, Globe, Target, Loader2, User, Menu, X, Shield } from "lucide-react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis } from "recharts"
import type { AlumniProfile } from "@/types/database.types"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [menuSolid, setMenuSolid] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [stats, setStats] = useState<AnnuaireStats>(DEFAULT_STATS)
  const heroRef = useRef<HTMLElement | null>(null)
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => {
    document.body.classList.add("hide-global-nav")
    return () => document.body.classList.remove("hide-global-nav")
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUserPhotoUrl(parsedUser.photo_url || null)
        setUserRole(parsedUser.role || "")
      } catch {
        setUserPhotoUrl(null)
        setUserRole("")
      }
    }
  }, [])
  const isAdminOrModerator = userRole === "admin" || userRole === "moderateur"

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
      const progress = Math.min(Math.max(y / 260, 0), 1)
      const translateY = -120 * progress
      const opacity = 1 - progress

      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${translateY}px)`
        heroRef.current.style.opacity = String(opacity)
      }
      if (heroTitleRef.current) {
        heroTitleRef.current.style.opacity = String(opacity)
      }

      setMenuSolid(y > 220)
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
      <style jsx global>{`
        body.hide-global-nav > nav {
          display: none !important;
        }
      `}</style>

      {/* Menu local superposé */}
      <div
        className={`fixed left-0 top-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-3 border-b transition-all duration-300 ${
          menuSolid ? "bg-white border-[#d9d9d9] shadow-sm" : "bg-transparent border-white/80"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img src="/logo/logo_alumni_bleu.png" alt="France Alumni Connect" className="h-10 w-auto object-contain" />
            <span
              className={`font-bold text-xl uppercase tracking-wide hidden sm:block ${
                menuSolid ? "text-[#3558A2]" : "text-white"
              }`}
              style={{
                letterSpacing: "0.05em",
                textShadow: menuSolid
                  ? "none"
                  : `
                    2px 2px 0 #ea292c,
                    3px 3px 0 #ea292c,
                    4px 4px 0 #f48988,
                    5px 5px 0 #f48988
                  `,
              }}
            >
              France Alumni Connect
            </span>
          </Link>
          <div className={`hidden md:flex items-center gap-6 ${menuSolid ? "text-[#3558A2]" : "text-white"}`}>
            <Link href="/a-propos" className="text-base font-semibold">à propos</Link>
            <Link href="/actualites" className="text-base font-semibold">actualités</Link>
            <Link href="https://talent-diaspora.fr/" target="_blank" rel="noopener noreferrer" className="text-base font-semibold">emploi</Link>
            <Link href="/formation" className="text-base font-semibold">formation</Link>
            <Link href="/annuaire" className="text-base font-semibold">annuaire</Link>
            {isAuthenticated && isAdminOrModerator && (
              <Link href="/admin" className={`inline-flex items-center gap-1.5 text-base font-semibold ${menuSolid ? "text-[#3558A2]" : "text-[#fcd116]"}`}>
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <Link
                href="/profil"
                className={`inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border ${
                  menuSolid ? "border-[#3558A2]" : "border-[#f48988]"
                }`}
              >
                {userPhotoUrl ? (
                  <img src={userPhotoUrl} alt="Photo de profil" className="h-full w-full object-cover" />
                ) : (
                  <User className={`h-4 w-4 ${menuSolid ? "text-[#3558A2]" : "text-[#f48988]"}`} />
                )}
              </Link>
            ) : (
              <Link
                href="/connexion"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                  menuSolid ? "border-[#3558A2]" : "border-[#f48988]"
                }`}
              >
                <User className={`h-4 w-4 ${menuSolid ? "text-[#3558A2]" : "text-[#f48988]"}`} />
              </Link>
            )}
          </div>
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border md:hidden ${
              menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
            }`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div
            className={`mx-auto mt-3 grid max-w-7xl grid-cols-2 gap-2 rounded-lg p-2 md:hidden ${
              menuSolid ? "border border-[#3558A2]/30 bg-white" : "border border-white/30 bg-[#1e2a5a]/80 backdrop-blur-sm"
            }`}
          >
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/a-propos"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              à propos
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/actualites"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              actualités
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="https://talent-diaspora.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              emploi
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/formation"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              formation
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/annuaire"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              annuaire
            </Link>
            {isAuthenticated && isAdminOrModerator && (
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/admin"
                className={`col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                  menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-[#fcd116] text-[#fcd116]"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/profil"
                className={`col-span-2 rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                  menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-[#f48988] text-[#f48988]"
                }`}
              >
                profil
              </Link>
            ) : (
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/connexion"
                className={`col-span-2 rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                  menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-[#f48988] text-[#f48988]"
                }`}
              >
                connexion
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Hero image */}
      <section ref={heroRef} className="fixed left-0 top-0 z-10 h-[300px] w-full overflow-hidden sm:h-[350px]">
        <img src="/annuaire/annuaire.jpg" alt="Annuaire" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex h-full max-w-7xl items-end px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <h1 ref={heroTitleRef} className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
            annuaire
          </h1>
        </div>
      </section>

      {/* Spacer du hero */}
      <div className="h-[300px] sm:h-[350px]" />

      {/* Filters */}
      <section className="py-4 bg-[#ffe8e4] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-3 sm:gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-semibold sm:text-base">Recherche & Filtres:</span>
          </div>

          {isAuthenticated ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="bg-white rounded-lg p-1 flex flex-col sm:flex-row gap-2 flex-1">
                <div className="flex items-center gap-2 px-3 w-full">
                  <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Nom, université, entreprise..."
                    className="flex-1 outline-none text-foreground py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col lg:w-auto">
                <label className="text-sm font-medium mb-1">Secteur d&apos;activité</label>
                <select
                  className="bg-white rounded-md border border-input px-3 py-2 text-sm min-w-0 lg:min-w-[180px]"
                  value={filterSecteur}
                  onChange={(e) => setFilterSecteur(e.target.value)}
                >
                  <option value="">Tous</option>
                  {secteurs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex w-full flex-col lg:w-auto">
                <label className="text-sm font-medium mb-1">Ville</label>
                <select
                  className="bg-white rounded-md border border-input px-3 py-2 text-sm min-w-0 lg:min-w-[180px]"
                  value={filterVille}
                  onChange={(e) => setFilterVille(e.target.value)}
                >
                  <option value="">Toutes</option>
                  {villes.filter(Boolean).map((ville) => (
                    <option key={ville} value={ville}>
                      {ville}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-md border border-input p-3 text-sm text-muted-foreground">
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
