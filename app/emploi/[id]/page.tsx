import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { jobPostings } from "@/lib/fake-data"
import { ArrowLeft, Building2, MapPin, Clock, CheckCircle2, Share2 } from "lucide-react"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = jobPostings.find((j) => j.id === params.id)

  if (!job) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="bg-muted py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/emploi">
            <Button variant="ghost" className="hover:bg-background">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux offres
            </Button>
          </Link>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="font-serif text-4xl font-bold mb-4">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span className="font-semibold text-foreground">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{job.postedDate}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[#0055A4]">{job.type}</Badge>
                  <Badge variant="outline">{job.sector}</Badge>
                  {job.remote && <Badge variant="outline">Télétravail possible</Badge>}
                  {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                </div>
              </div>

              <Card className="mb-8">
                <CardContent className="pt-6">
                  <h2 className="font-serif text-2xl font-bold mb-4">Description du poste</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{job.description}</p>

                  <p className="text-muted-foreground leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardContent className="pt-6">
                  <h2 className="font-serif text-2xl font-bold mb-4">Profil recherché</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#0055A4] flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-serif text-2xl font-bold mb-4">À propos de l'entreprise</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {job.company} est une entreprise leader dans le secteur {job.sector.toLowerCase()} en Guinée. Nous
                    sommes engagés à créer un environnement de travail stimulant et à offrir des opportunités de
                    développement professionnel à nos collaborateurs.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="pt-6">
                  <div className="space-y-4 mb-6">
                    <Button className="w-full bg-[#0055A4] hover:bg-[#0055A4]/90" size="lg">
                      Postuler maintenant
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Sauvegarder l'offre
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Share2 className="mr-2 h-4 w-4" />
                      Partager
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-serif text-lg font-bold mb-4">Informations clés</h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Type de contrat</p>
                        <p className="font-semibold">{job.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Secteur</p>
                        <p className="font-semibold">{job.sector}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Localisation</p>
                        <p className="font-semibold">{job.location}</p>
                      </div>
                      {job.salary && (
                        <div>
                          <p className="text-muted-foreground mb-1">Rémunération</p>
                          <p className="font-semibold">{job.salary}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground mb-1">Télétravail</p>
                        <p className="font-semibold">{job.remote ? "Possible" : "Non"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <p className="text-xs text-muted-foreground">
                      Cette offre est réservée aux membres du réseau France Alumni Guinée.{" "}
                      <Link href="/inscription" className="text-[#0055A4] hover:underline">
                        Inscrivez-vous
                      </Link>{" "}
                      pour postuler.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
