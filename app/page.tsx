"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ArrowRight, Users, Briefcase, GraduationCap, Globe, MapPin, Mail, Calendar, Clock, MapPin as MapPinIcon, User } from "lucide-react"
import { articles, alumniMembers } from "@/lib/fake-data"
import { useEffect, useState } from "react"
import type { CarouselApi } from "@/components/ui/carousel"

const heroSlides = [
  { src: "/accueil/caroussel/anime.gif", alt: "France Alumni Connect" },
  { src: "/accueil/caroussel/fixe.png", alt: "France Alumni Connect" },
]

export default function HomePage() {
  const [api, setApi] = useState<CarouselApi>()
  const featuredArticles = articles.slice(0, 3)
  const featuredAlumni = alumniMembers.slice(-3)
  const upcomingEvents = articles.filter((a) => a.category === "Événements").slice(0, 2)

  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => api.scrollNext(), 5000)
    return () => clearInterval(interval)
  }, [api])

  return (
    <div className="min-h-screen bg-[#ffe8e4]">
      {/* Hero : carrousel d'images */}
      <section className="relative w-full overflow-hidden bg-muted/30 py-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <Carousel setApi={setApi} opts={{ loop: true }}>
            <CarouselContent className="ml-0">
              {heroSlides.map((slide, index) => (
              <CarouselItem key={index} className="pl-0 basis-full">
                <div className="relative w-full">
                  <img
                    src={slide.src}
                    alt={slide.alt}
                      className="w-full h-auto object-contain max-h-[220px] sm:max-h-[260px]"
                  />
                </div>
              </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </section>

      {/* Ancienne section hero (titré + bouton) — commentée
      <section className="lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              <AnimatedTitle />
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#FCD116] text-[#3558A2] hover:bg-[#FCD116]/90 font-semibold">
                Rejoindre le réseau
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-[#ffe8e4]/10 rounded-tl-full blur-3xl"></div>
      </section>
      */}


      {/* Actualités et Évènements */}
      <section className="py-8 bg-muted">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Actualités - 2/3 */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-end mb-6">
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

              <div className="grid md:grid-cols-3 gap-4">
                {featuredArticles.map((article) => (
                  <Link key={article.id} href={`/actualites/${article.id}`} className="block">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-32 object-cover"
                      />
                      <CardContent className="pt-4 pb-4 px-4">
                        <div className="inline-block px-2 py-0.5 bg-[#3558A2]/10 text-[#3558A2] text-[10px] font-semibold rounded-full mb-2">
                          {article.category}
                        </div>
                        <h3 className="font-serif text-base font-bold mb-1 line-clamp-2">{article.title}</h3>
                        {/* <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{article.excerpt}</p> */}
                        <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{article.author}</p>
                        <span className="text-xs text-muted-foreground">{article.date}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Évènements - 1/3 */}
            <div className="lg:col-span-1">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Événements</h2>
                  <p className="text-lg text-muted-foreground">Rejoignez nos événements à venir</p>
                </div>
                {/* Bouton "Voir tout" supprimé pour harmonisation (pas de page évènements dédiée) */}
              </div>

              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="px-3 py-[2px]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#3558A2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-[#3558A2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="inline-block px-2 py-1 bg-[#ffe8e4] text-[#3558A2] text-xs font-semibold rounded-full mb-0">
                            Événement
                          </div>
                          <h3 className="font-serif text-base font-bold mb-1 line-clamp-2">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
      <section className="py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
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
                    <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-[#3558A2] transition-colors">
                      {member.name}
                    </h3>
                    {/* <p className="text-sm text-[#3558A2] font-semibold mb-2">{member.currentPosition}</p> */}
                    <p className="text-sm text-muted-foreground mb-3">{member.company}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {member.formation} - {member.university}
                      </span>
                    </div>
                    {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span>{member.sector}</span>
                    </div> */}
                    {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{member.city}</span>
                    </div> */}
                  </div>

                  <div className="flex gap-2">
                    <Link href="/annuaire" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent hover:bg-[#3558A2] hover:text-white">
                        Voir l'annuaire
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-transparent hover:bg-[#3558A2] hover:text-white"
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
      <section className="py-2 bg-muted">
        <div className="">
          <div className="rounded-2xl p-8 sm:p-4 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-1">Prêt à rejoindre notre communauté ?</h2>
            <p className="text-lg  mb-2 max-w-2xl mx-auto">
              Inscrivez-vous dès maintenant pour découvrir les talents du réseau et tisser de nouvelles connexions 
              au sein de France Alumni Guinée.
            </p>
            <Button size="lg" className="bg-[#ea292c] hover:bg-[#f48988]/90 font-semibold">
              S'inscrire maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
