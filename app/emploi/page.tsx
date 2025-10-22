import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { jobPostings } from "@/lib/fake-data"
import { Briefcase, MapPin, Clock, Building2, Search, Filter } from "lucide-react"

export default function EmploiPage() {
  const jobTypes = ["Tous", "CDI", "CDD", "Stage", "Freelance"]
  const sectors = ["Tous", "Technologie", "Finance", "Santé", "Éducation", "Télécommunications"]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0055A4] via-[#0055A4] to-[#003d7a] text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Opportunités d'Emploi
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8">
              Découvrez les offres d'emploi exclusives pour les membres du réseau France Alumni Guinée
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Titre du poste, entreprise..."
                  className="flex-1 outline-none text-foreground"
                />
              </div>
              <div className="flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <input type="text" placeholder="Localisation" className="flex-1 outline-none text-foreground" />
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
              <p className="text-sm font-medium mb-2">Type de contrat</p>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map((type) => (
                  <Button
                    key={type}
                    variant={type === "Tous" ? "default" : "outline"}
                    size="sm"
                    className={type === "Tous" ? "bg-[#0055A4] hover:bg-[#0055A4]/90" : ""}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Secteur</p>
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
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{jobPostings.length}</span> offres disponibles
            </p>
            <Button variant="outline" className="hover:bg-[#0055A4] hover:text-white bg-transparent">
              Publier une offre
            </Button>
          </div>

          <div className="space-y-6">
            {jobPostings.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#0055A4]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-[#0055A4]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif text-xl font-bold mb-2">
                            <Link href={`/emploi/${job.id}`} className="hover:text-[#0055A4]">
                              {job.title}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span className="font-medium">{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{job.postedDate}</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{job.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-[#0055A4]/10 text-[#0055A4]">
                              {job.type}
                            </Badge>
                            <Badge variant="outline">{job.sector}</Badge>
                            {job.remote && <Badge variant="outline">Télétravail possible</Badge>}
                            {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2">
                      <Link href={`/emploi/${job.id}`} className="flex-1 lg:flex-initial">
                        <Button className="w-full bg-[#0055A4] hover:bg-[#0055A4]/90">Voir l'offre</Button>
                      </Link>
                      <Button variant="outline" className="flex-1 lg:flex-initial bg-transparent">
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0055A4] to-[#003d7a] rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Vous recrutez ?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Publiez vos offres d'emploi et accédez à un vivier de talents qualifiés issus des meilleures universités
              françaises.
            </p>
            <Button size="lg" className="bg-[#FCD116] text-[#0055A4] hover:bg-[#FCD116]/90 font-semibold">
              Publier une offre
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
