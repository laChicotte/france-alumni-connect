"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { alumniMembers } from "@/lib/fake-data"
import { Search, Filter, GraduationCap, Briefcase, MapPin, Mail, Users, TrendingUp, Globe, Target } from "lucide-react"
import { useMemo } from "react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis } from "recharts"

export default function AnnuairePage() {
  const sectors = ["Tous", "Technologie", "Finance", "Santé", "Éducation", "Droit", "Architecture"]
  const cities = ["Tous", "Conakry", "Kindia", "Labé", "Kankan"]

  // Calcul des statistiques
  const stats = useMemo(() => {
    const totalAlumni = alumniMembers.length
    
    // Calcul par secteur
    const sectorCount: Record<string, number> = {}
    alumniMembers.forEach(member => {
      sectorCount[member.sector] = (sectorCount[member.sector] || 0) + 1
    })
    
    // Calcul par ville
    const cityCount: Record<string, number> = {}
    alumniMembers.forEach(member => {
      cityCount[member.city] = (cityCount[member.city] || 0) + 1
    })

    // Données pour les graphiques
    const sectorData = Object.entries(sectorCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const cityData = Object.entries(cityCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Simulation de données de genre (50/50 pour l'exemple)
    const genderData = [
      { name: "Homme", value: Math.floor(totalAlumni * 0.54) },
      { name: "Femme", value: Math.floor(totalAlumni * 0.46) }
    ]

    // Simulation de statut professionnel
    const statusData = [
      { name: "Employé", value: Math.floor(totalAlumni * 0.65) },
      { name: "Étudiant", value: Math.floor(totalAlumni * 0.20) },
      { name: "Entrepreneur", value: Math.floor(totalAlumni * 0.10) },
      { name: "Sans emploi", value: Math.floor(totalAlumni * 0.05) }
    ]

    return {
      totalAlumni,
      sectorData,
      cityData,
      genderData,
      statusData
    }
  }, [])

  const COLORS = ['#0055A4', '#FCD116', '#003d7a', '#6B7280', '#9CA3AF']

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0055A4] via-[#0055A4] to-[#003d7a] text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Annuaire des Alumni
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8">
              Connectez-vous avec plus de 600 alumni guinéens diplômés de l'enseignement supérieur français
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nom, université, entreprise..."
                  className="flex-1 outline-none text-foreground"
                />
              </div>
              <Button className="bg-[#0055A4] hover:bg-[#0055A4]/90">Rechercher</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-muted border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">Filtres:</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Secteur d'activité</p>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <Button
                    key={sector}
                    variant={sector === "Tous" ? "default" : "outline"}
                    size="sm"
                    className={sector === "Tous" ? "bg-[#0055A4] hover:bg-[#0055A4]/90" : ""}
                  >
                    {sector}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Ville</p>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Button
                    key={city}
                    variant={city === "Tous" ? "default" : "outline"}
                    size="sm"
                    className={city === "Tous" ? "bg-[#0055A4] hover:bg-[#0055A4]/90" : ""}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{alumniMembers.length}</span> alumni trouvés
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumniMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-4">
                      <img
                        src={member.photo || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-1 group-hover:text-[#0055A4] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-[#0055A4] font-semibold mb-2">{member.currentPosition}</p>
                    <p className="text-sm text-muted-foreground mb-3">{member.company}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {member.formation} - {member.university}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span>{member.sector}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{member.city}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 bg-transparent hover:bg-[#0055A4] hover:text-white">
                          Voir le profil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl font-bold text-left">{member.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="flex items-start gap-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={member.photo || "/placeholder.svg"}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-serif text-xl font-bold text-[#0055A4] mb-2">{member.currentPosition}</h3>
                              <p className="text-lg text-muted-foreground mb-4">{member.company}</p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <GraduationCap className="h-4 w-4 text-[#0055A4]" />
                                  <span><strong>{member.formation}</strong> - {member.university} ({member.promotion})</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Briefcase className="h-4 w-4 text-[#0055A4]" />
                                  <span>{member.sector}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-[#0055A4]" />
                                  <span>{member.city}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">À propos</h4>
                            <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t">
                            <Button className="flex-1 bg-[#0055A4] hover:bg-[#0055A4]/90">
                              <Mail className="mr-2 h-4 w-4" />
                              Contacter
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-transparent hover:bg-[#0055A4] hover:text-white"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Alumni en Chiffres */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Nos Alumni en Chiffres</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les statistiques de notre communauté d'alumni guinéens
            </p>
          </div>

          {/* Cartes de Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

          {/* Graphiques */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Statut Professionnel */}
            <Card>
              <CardHeader>
                <CardTitle>Statut Professionnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Nombre" }
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={stats.statusData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#0055A4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Répartition par Genre */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Genre</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Nombre" }
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={stats.genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
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

          {/* Secteurs d'activité */}
          <Card>
            <CardHeader>
              <CardTitle>Top Secteurs d'Activité</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: { label: "Nombre" }
                }}
                className="h-[300px]"
              >
                <BarChart data={stats.sectorData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#0055A4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0055A4] to-[#003d7a] rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Vous n'êtes pas encore inscrit ?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez l'annuaire pour être visible auprès de la communauté et développer votre réseau professionnel.
            </p>
            <Button size="lg" className="bg-[#FCD116] text-[#0055A4] hover:bg-[#FCD116]/90 font-semibold">
              Rejoindre l'annuaire
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
