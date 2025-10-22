import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { alumniMembers } from "@/lib/fake-data"
import { ArrowLeft, GraduationCap, Briefcase, MapPin, Mail, Linkedin, Calendar } from "lucide-react"

export default function AlumniProfilePage({ params }: { params: { id: string } }) {
  const member = alumniMembers.find((m) => m.id === params.id)

  if (!member) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="bg-muted py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/annuaire">
            <Button variant="ghost" className="hover:bg-background">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'annuaire
            </Button>
          </Link>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-muted mb-4">
                      <img
                        src={member.photo || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h1 className="font-serif text-2xl font-bold mb-2">{member.name}</h1>
                    <p className="text-[#0055A4] font-semibold mb-1">{member.currentPosition}</p>
                    <p className="text-sm text-muted-foreground mb-4">{member.company}</p>
                    <Badge variant="outline" className="mb-4">
                      Promotion {member.promotion}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Button className="w-full bg-[#0055A4] hover:bg-[#0055A4]/90">
                      <Mail className="mr-2 h-4 w-4" />
                      Contacter
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </Button>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Localisation</p>
                        <p className="text-sm text-muted-foreground">{member.city}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Secteur</p>
                        <p className="text-sm text-muted-foreground">{member.sector}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground break-all">{member.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-serif text-2xl font-bold mb-4">À propos</h2>
                  <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-serif text-2xl font-bold mb-4">Formation</h2>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#0055A4]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-[#0055A4]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{member.formation}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{member.university}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Promotion {member.promotion}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-serif text-2xl font-bold mb-4">Expérience professionnelle</h2>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#0055A4]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-[#0055A4]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{member.currentPosition}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{member.company}</p>
                      <Badge variant="outline" className="text-xs">
                        {member.sector}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expertise */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-serif text-2xl font-bold mb-4">Domaines d'expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-[#0055A4]/10 text-[#0055A4]">
                      {member.sector}
                    </Badge>
                    <Badge variant="secondary" className="bg-[#0055A4]/10 text-[#0055A4]">
                      Gestion de projet
                    </Badge>
                    <Badge variant="secondary" className="bg-[#0055A4]/10 text-[#0055A4]">
                      Leadership
                    </Badge>
                    <Badge variant="secondary" className="bg-[#0055A4]/10 text-[#0055A4]">
                      Innovation
                    </Badge>
                    <Badge variant="secondary" className="bg-[#0055A4]/10 text-[#0055A4]">
                      Développement international
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-serif text-2xl font-bold mb-4">Centres d'intérêt</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Mentorat, entrepreneuriat social, développement durable, éducation, innovation technologique,
                    coopération franco-guinéenne.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
