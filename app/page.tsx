import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Briefcase, GraduationCap, Globe } from "lucide-react"
import { articles } from "@/lib/fake-data"

export default function HomePage() {
  const featuredArticles = articles.slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0055A4] via-[#0055A4] to-[#003d7a] text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Connectez-vous au réseau France Alumni Guinée
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
              Rejoignez une communauté dynamique d'anciens étudiants guinéens diplômés de France. Partagez, collaborez
              et contribuez au développement de la Guinée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#FCD116] text-[#0055A4] hover:bg-[#FCD116]/90 font-semibold">
                Rejoindre le réseau
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-[#FCD116]/10 rounded-tl-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0055A4] text-white rounded-lg mb-4">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-[#0055A4] mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Alumni inscrits</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0055A4] text-white rounded-lg mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-[#0055A4] mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Universités françaises</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0055A4] text-white rounded-lg mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-[#0055A4] mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Opportunités d'emploi</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0055A4] text-white rounded-lg mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-[#0055A4] mb-2">15+</div>
              <div className="text-sm text-muted-foreground">Partenaires institutionnels</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Notre Mission</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Valoriser les talents, favoriser les opportunités et renforcer les liens entre la France et la Guinée
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-[#0055A4] transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-[#0055A4]/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#0055A4]">1</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Représentation et influence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Valoriser la diaspora guinéenne diplômée de France et contribuer à un lobbying positif auprès des
                  entreprises et institutions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FCD116] transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-[#FCD116]/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#0055A4]">2</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Développement local</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Promouvoir le transfert de compétences au service du développement en Guinée et renforcer les
                  synergies avec les plateformes partenaires.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#0055A4] transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-[#0055A4]/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#0055A4]">3</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Solidarité et soutien</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Favoriser le mentorat, l'entraide et mobiliser les alumni autour d'initiatives citoyennes, éducatives
                  et environnementales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Actualités récentes</h2>
              <p className="text-lg text-muted-foreground">Découvrez les parcours inspirants de nos alumni</p>
            </div>
            <Link href="/actualites">
              <Button variant="outline">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="pt-6">
                  <div className="inline-block px-3 py-1 bg-[#0055A4]/10 text-[#0055A4] text-xs font-semibold rounded-full mb-3">
                    {article.category}
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{article.date}</span>
                    <Link href={`/actualites/${article.id}`} className="text-[#0055A4] font-semibold hover:underline">
                      Lire plus →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0055A4] to-[#003d7a] rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Prêt à rejoindre notre communauté ?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Inscrivez-vous dès maintenant pour accéder à l'annuaire, aux opportunités d'emploi et aux événements
              exclusifs du réseau.
            </p>
            <Button size="lg" className="bg-[#FCD116] text-[#0055A4] hover:bg-[#FCD116]/90 font-semibold">
              S'inscrire maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
