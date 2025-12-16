"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowRight, Users, Briefcase, GraduationCap, Globe, MapPin, Mail, Calendar, Clock, MapPin as MapPinIcon, User } from "lucide-react"
import { articles, alumniMembers } from "@/lib/fake-data"
import { AnimatedTitle } from "@/components/animated-title"

export default function HomePage() {
  const featuredArticles = articles.slice(0, 2)
  const featuredAlumni = alumniMembers.slice(-3)
  const upcomingEvents = articles.filter((a) => a.category === "Événements").slice(0, 2)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0055A4] via-[#0055A4] to-[#003d7a] text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              <AnimatedTitle />
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
            Rejoignez une communauté dynamique qui connecte les talents guinéens formés en France, ouvre des opportunités professionnelles 
            et soutient l’entrepreneuriat au service de l’économie locale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#FCD116] text-[#0055A4] hover:bg-[#FCD116]/90 font-semibold">
                Rejoindre le réseau
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-[#FCD116]/10 rounded-tl-full blur-3xl"></div>
      </section>

      {/* Actualités et Événements */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Actualités - 2/3 */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Actualités récentes</h2>
                  <p className="text-lg text-muted-foreground">Au fil des nouvelles : nos alumni</p>
                </div>
                <Link href="/actualites">
                  <Button variant="outline">
                    Voir tout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" className="inline-flex items-center text-[#0055A4] font-semibold hover:underline p-0 h-auto">
                              Lire l'article
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-serif text-2xl font-bold text-left">{article.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>{article.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{article.date}</span>
                                </div>
                                <span className="inline-block px-2 py-1 bg-[#0055A4]/10 text-[#0055A4] text-xs font-semibold rounded-full">
                                  {article.category}
                                </span>
                              </div>
                              <img
                                src={article.image || "/placeholder.svg"}
                                alt={article.title}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <div className="prose max-w-none">
                                <p className="text-lg text-muted-foreground leading-relaxed mb-6">{article.excerpt}</p>
                                <div className="space-y-4 text-foreground">
                                  <p>{article.content}</p>
                                  <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat.
                                  </p>
                                  <h3 className="font-serif text-xl font-bold mt-6 mb-3">Un parcours inspirant</h3>
                                  <p>
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                                    laborum.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Événements - 1/3 */}
            <div className="lg:col-span-1">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Evénements</h2>
                  <p className="text-lg text-muted-foreground">Rejoignez nos événements à venir</p>
                </div>
                {/* Bouton "Voir tout" supprimé pour harmonisation (pas de page événements dédiée) */}
              </div>

              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="px-3 py-[9px]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#0055A4]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-[#0055A4]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="inline-block px-2 py-1 bg-[#FCD116]/20 text-[#0055A4] text-xs font-semibold rounded-full mb-2">
                            Événement
                          </div>
                          <h3 className="font-serif text-base font-bold mb-1 line-clamp-2">{event.title}</h3>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>—</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-3 w-3" />
                              <span className="line-clamp-1">—</span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">&nbsp;</span>
                            <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                              S'inscrire
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Aperçu Annuaire */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Annuaire des Alumni</h2>
              <p className="text-lg text-muted-foreground">Découvrez les parcours inspirants de nos alumni</p>
            </div>
            <Link href="/annuaire">
              <Button variant="outline">
                Voir tout l'annuaire
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredAlumni.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted mb-4">
                      <img
                        src={member.photo || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-[#0055A4] transition-colors">
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
                    <Link href="/annuaire" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent hover:bg-[#0055A4] hover:text-white">
                        Voir l'annuaire
                      </Button>
                    </Link>
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0055A4] to-[#003d7a] rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Prêt à rejoindre notre communauté ?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Inscrivez-vous dès maintenant pour découvrir les talents du réseau et tisser de nouvelles connexions 
              au sein de France Alumni Guinée.
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
