"use client"

import { Card, CardContent } from "@/components/ui/card"
import { teamMembers, partners } from "@/lib/fake-data"
import { Users, Heart, Globe, Award } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function AboutPage() {
  type PublicPartner = { name: string; logo: string; site_web?: string | null }
  const [heroTitle, setHeroTitle] = useState("à propos")
  const [publicPartners, setPublicPartners] = useState<PublicPartner[]>(partners)
  const marqueePartners = [...publicPartners, ...publicPartners]
  const currentTitleRef = useRef("à propos")
  const valuesRef = useRef<HTMLElement | null>(null)
  const objectivesRef = useRef<HTMLElement | null>(null)
  const partnersRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const loadPartners = async () => {
      try {
        const res = await fetch("/api/partenaires/public", { cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (!res.ok || !Array.isArray(data?.partners) || data.partners.length === 0) return
        setPublicPartners(data.partners as PublicPartner[])
      } catch {
        // fallback silencieux vers données locales
      }
    }

    loadPartners()
  }, [])

  useEffect(() => {
    const updateTitle = () => {
      const probeY = window.innerHeight * 0.38
      const valuesTop = valuesRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const objectivesTop = objectivesRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const partnersTop = partnersRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const footerTop = document.querySelector("footer")?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const isFooterStartingToShow = footerTop <= window.innerHeight

      const nextTitle =
        isFooterStartingToShow || partnersTop <= probeY
          ? "nos partenaires"
          : objectivesTop <= probeY
            ? "nos objectifs"
            : valuesTop <= probeY
              ? "nos valeurs"
              : "à propos"

      if (currentTitleRef.current !== nextTitle) {
        currentTitleRef.current = nextTitle
        setHeroTitle(nextTitle)
      }
    }

    updateTitle()
    window.addEventListener("scroll", updateTitle, { passive: true })
    window.addEventListener("resize", updateTitle)
    return () => {
      window.removeEventListener("scroll", updateTitle)
      window.removeEventListener("resize", updateTitle)
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="sticky top-20 z-20 h-[210px] w-full overflow-hidden sm:h-[270px]"
      >
        <img
          src="/apropos/apropos.jpg"
          alt="France Alumni Guinée"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-6 sm:pb-8">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
            {heroTitle}
          </h1>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-base text-justify sm:text-lg text-[#3558A2] leading-relaxed">
              France Alumni Guinée, dans le prolongement de <strong>Campus France Guinée</strong>, est une
              communauté dynamique de Guinéennes et Guinéens diplômés de l&apos;enseignement français, rassemblés
              par leur parcours d&apos;études en France et leur engagement pour la coopération, le partage
              d&apos;expériences, la création d&apos;opportunités et l&apos;impact positif sur la Guinée.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="py-4 bg-[#ffe8e4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            {/* <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Nos Valeurs</h2> */}
            <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
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
      <section ref={objectivesRef} className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Nos Objectifs</h2> */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-center">
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
              
              <div className="space-y-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">Représentation et influence</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Valoriser la diaspora guinéenne diplômée de France et contribuer à un lobbying positif auprès des
                      entreprises et institutions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">Développement local</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Promouvoir le transfert de compétences au service du développement en Guinée et renforcer les
                      synergies avec les plateformes partenaires.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">Solidarité et soutien</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Favoriser le mentorat, l'entraide et mobiliser les alumni autour d'initiatives citoyennes, éducatives
                      et environnementales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">Rayonnement international</h3>
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
      <section ref={partnersRef} className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden">
            <div className="partners-marquee-track">
              {marqueePartners.map((partner, index) => (
                <div key={`${partner.name}-${index}`} className="partners-marquee-item">
                  <img
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    className="h-24 w-full object-contain opacity-85 transition-opacity duration-200 hover:opacity-100 sm:h-28"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`
        .partners-marquee-track {
          display: flex;
          gap: 0.75rem;
          width: max-content;
          animation: partners-marquee-scroll 34s linear infinite;
          will-change: transform;
        }

        .partners-marquee-item {
          width: 150px;
          flex: 0 0 auto;
        }

        @media (min-width: 768px) {
          .partners-marquee-item {
            width: 180px;
          }
        }

        .partners-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes partners-marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.5rem));
          }
        }
      `}</style>
   
    </div>
  )
}
