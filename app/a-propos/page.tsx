import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { teamMembers, partners } from "@/lib/fake-data"
import { Target, Users, Heart, Globe, Award, Lightbulb } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0055A4] via-[#0055A4] to-[#003d7a] text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              À propos de France Alumni Guinée
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Une communauté dynamique d'anciens étudiants guinéens diplômés de France, unis pour contribuer au
              développement de la Guinée et renforcer les liens franco-guinéens.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0055A4] text-white rounded-lg mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-3xl font-bold mb-4">Notre Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                France Alumni Guinée a pour mission de valoriser les talents de la diaspora guinéenne diplômée de France
                et de contribuer au développement socio-économique de la Guinée.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nous facilitons le networking, le mentorat et les opportunités professionnelles pour nos membres, tout
                en promouvant les relations franco-guinéennes dans les domaines de l'éducation, de la culture et de
                l'économie.
              </p>
            </div>

            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FCD116] text-[#0055A4] rounded-lg mb-6">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-3xl font-bold mb-4">Notre Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Devenir le réseau de référence des alumni guinéens de France, reconnu pour son impact positif sur le
                développement de la Guinée et la promotion de l'excellence académique et professionnelle.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nous aspirons à créer un écosystème où chaque alumni peut contribuer, s'épanouir et inspirer les
                générations futures.
              </p>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="font-serif text-3xl font-bold mb-8 text-center">Nos Valeurs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-[#0055A4] transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#0055A4]/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-[#0055A4]" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">Solidarité</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nous cultivons l'entraide et le soutien mutuel entre alumni pour favoriser la réussite collective.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-[#FCD116] transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#FCD116]/20 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-[#0055A4]" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">Excellence</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nous promouvons l'excellence académique et professionnelle dans tous nos domaines d'intervention.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-[#0055A4] transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#0055A4]/10 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-[#0055A4]" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">Engagement</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nous sommes engagés pour le développement durable et l'impact social positif en Guinée.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold mb-12 text-center">Nos Objectifs</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#0055A4] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold mb-2">Représentation et influence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Valoriser la diaspora guinéenne diplômée de France et contribuer à un lobbying positif auprès des
                  entreprises et institutions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#0055A4] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold mb-2">Développement local</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Promouvoir le transfert de compétences au service du développement en Guinée et renforcer les
                  synergies avec les plateformes partenaires.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#0055A4] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold mb-2">Solidarité et soutien</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Favoriser le mentorat, l'entraide et mobiliser les alumni autour d'initiatives citoyennes, éducatives
                  et environnementales.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#0055A4] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold mb-2">Rayonnement international</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Renforcer les liens entre la France et la Guinée et promouvoir l'excellence guinéenne à
                  l'international.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">Notre Équipe</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une équipe passionnée et engagée pour faire vivre le réseau France Alumni Guinée
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-[#0055A4] font-semibold mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Partners */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0055A4] text-white rounded-lg mb-6 mx-auto">
              <Globe className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">Nos Partenaires</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nous collaborons avec des institutions de référence pour renforcer notre impact
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {partners.map((partner, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="flex items-center justify-center p-6 hover:shadow-lg transition-shadow h-full">
                      <div className="text-center">
                        <img
                          src={partner.logo || "/placeholder.svg"}
                          alt={partner.name}
                          className="w-full h-16 object-contain mb-2"
                        />
                        <p className="text-xs text-muted-foreground font-medium">{partner.name}</p>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0055A4] to-[#003d7a] rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Rejoignez notre communauté</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Faites partie d'un réseau dynamique d'alumni engagés pour le développement de la Guinée
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/inscription"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#FCD116] text-[#0055A4] font-semibold rounded-lg hover:bg-[#FCD116]/90 transition-colors"
              >
                Devenir membre
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
