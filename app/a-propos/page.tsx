"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { teamMembers, partners } from "@/lib/fake-data"
import { Users, Heart, Globe, Award } from "lucide-react"
import { useEffect, useState } from "react"
import type { CarouselApi } from "@/components/ui/carousel"

export default function AboutPage() {
  const [api, setApi] = useState<CarouselApi>()
  
  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 3000) // Défilement toutes les 3 secondes

    return () => clearInterval(interval)
  }, [api])
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#3558A2] via-[#3558A2] to-[#3558A2] text-white py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 whitespace-nowrap">
              À propos de France Alumni Guinée
            </h1>
            
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-8 text-center">Nos Valeurs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-[#3558A2] transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#3558A2]/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-[#3558A2]" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">Solidarité</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nous cultivons l'entraide et le soutien mutuel entre alumni pour favoriser la réussite collective.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-[#f48988] transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#ffe8e4] rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-[#3558A2]" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">Excellence</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nous promouvons l'excellence académique et professionnelle dans tous nos domaines d'intervention.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-[#3558A2] transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#3558A2]/10 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-[#3558A2]" />
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image à gauche */}
            <div className="order-2 lg:order-1">
              <img
                src="/apropos/nos_objectifs.jpeg"
                alt="Nos objectifs"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Objectifs à droite */}
            <div className="order-1 lg:order-2">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-8">Nos Objectifs</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">
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
                    <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">
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
                    <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">
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
                    <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">
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
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#3558A2] text-white rounded-lg mb-6 mx-auto">
              <Globe className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">Nos Partenaires</h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              setApi={setApi}
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
   
    </div>
  )
}
