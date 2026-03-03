"use client"

import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { supabase } from "@/lib/supabase"
import { alumniMembers } from "@/lib/fake-data"
import { Search, Filter, GraduationCap, Briefcase, MapPin, Mail, Users, TrendingUp, Globe, Target, Loader2 } from "lucide-react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis } from "recharts"
import type { AlumniProfile } from "@/types/database.types"

type AlumniWithJoins = AlumniProfile & {
  secteurs?: { libelle: string } | null
  statuts_professionnels?: { libelle: string } | null
  users?: { email: string } | null
}

const PAGE_SIZE = 9

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

  // Statistiques (section statique - on y reviendra plus tard)
  const stats = useMemo(() => {
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

  const COLORS = ["#3558A2", "#FCD116", "#6B7280", "#9CA3AF", "#ea292c", "#3558A2", "#FCD116", "#6B7280"]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">
              Annuaire des Alumni
            </h1>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 bg-[#ffe8e4] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">Recherche & Filtres:</span>
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

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Secteur d&apos;activité</label>
                <select
                  className="bg-white rounded-md border border-input px-3 py-2 text-sm min-w-[180px]"
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

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Ville</label>
                <select
                  className="bg-white rounded-md border border-input px-3 py-2 text-sm min-w-[180px]"
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
              <div className="flex justify-between items-center mb-8">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {isAuthenticated ? filteredAlumni.length : displayedAlumni.length}
                  </span>{" "}
                  alumni
                  trouvés
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedAlumni.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow group">
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
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
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
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 bg-[#3558A2] hover:bg-[#3558A2]/90" onClick={() => router.push("/connexion")}>
              Se connecter
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => router.push("/inscription")}>
              Créer un compte
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nos Alumni en Chiffres - section statique (on y reviendra plus tard) */}
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
                <div className="text-3xl font-bold">{stats.totalAlumni.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Membres actifs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Répartition par Genre</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.genderData[0].value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Homme: {stats.genderData[0].value} | Femme: {stats.genderData[1].value}
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
                  <BarChart data={stats.statusData} layout="vertical">
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
                      data={stats.genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.genderData.map((entry, index) => (
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
                <BarChart data={stats.sectorData} layout="vertical">
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
