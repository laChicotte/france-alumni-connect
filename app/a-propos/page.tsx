"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { teamMembers, partners } from "@/lib/fake-data"
import { Users, Heart, Globe, Award, User, Menu, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { CarouselApi } from "@/components/ui/carousel"

const HERO_MAX_HEIGHT = 400
const HERO_MIN_HEIGHT = 200

export default function AboutPage() {
  const [api, setApi] = useState<CarouselApi>()
  const [heroHeight, setHeroHeight] = useState(HERO_MAX_HEIGHT)
  const [heroTitle, setHeroTitle] = useState("à propos")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const valuesRef = useRef<HTMLElement | null>(null)
  const objectivesRef = useRef<HTMLElement | null>(null)
  const partnersRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 3000) // Défilement toutes les 3 secondes

    return () => clearInterval(interval)
  }, [api])

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    const userData = localStorage.getItem("user")
    if (authStatus === "true" && userData) {
      setIsAuthenticated(true)
      try {
        const parsedUser = JSON.parse(userData)
        setUserPhotoUrl(parsedUser.photo_url || null)
      } catch {
        setUserPhotoUrl(null)
      }
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const nextHeight = Math.max(HERO_MIN_HEIGHT, HERO_MAX_HEIGHT - y * 0.5)
      setHeroHeight(nextHeight)

      const triggerY = nextHeight + 80
      const partnersTop = partnersRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const objectivesTop = objectivesRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const valuesTop = valuesRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY

      if (partnersTop <= triggerY) {
        setHeroTitle("nos partenaires")
      } else if (objectivesTop <= triggerY) {
        setHeroTitle("nos objectifs")
      } else if (valuesTop <= triggerY) {
        setHeroTitle("nos valeurs")
      } else {
        setHeroTitle("à propos")
      }
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="sticky top-0 z-20 w-full overflow-hidden"
        style={{ height: `${heroHeight}px` }}
      >
        <div className="absolute left-0 top-0 z-30 w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/80 pb-3">
            <Link href="/" className="flex items-center gap-4">
              <img src="/logo/logo_alumni_blanc.png" alt="France Alumni Connect" className="h-10 w-auto object-contain" />
              <span
                className="text-white font-bold text-xl uppercase tracking-wide hidden sm:block"
                style={{
                  letterSpacing: "0.05em",
                  textShadow: `
                    2px 2px 0 #ea292c,
                    3px 3px 0 #ea292c,
                    4px 4px 0 #f48988,
                    5px 5px 0 #f48988
                  `,
                }}
              >
                France Alumni Connect
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-white">
              <Link href="/a-propos" className="text-base font-semibold">à propos</Link>
              <Link href="/actualites" className="text-base font-semibold">actualités</Link>
              <Link href="/emploi" className="text-base font-semibold">emploi</Link>
              <Link href="/annuaire" className="text-base font-semibold">annuaire</Link>
              {isAuthenticated ? (
                <Link href="/profil" className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#f48988]">
                  {userPhotoUrl ? (
                    <img src={userPhotoUrl} alt="Photo de profil" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-[#f48988]" />
                  )}
                </Link>
              ) : (
                <Link href="/connexion" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f48988]">
                  <User className="h-4 w-4 text-[#f48988]" />
                </Link>
              )}
            </div>
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/50 text-white md:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {isMobileMenuOpen && (
            <div className="mx-auto mt-3 grid max-w-7xl grid-cols-2 gap-2 rounded-lg border border-white/30 bg-[#1e2a5a]/80 p-2 backdrop-blur-sm md:hidden">
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/a-propos" className="rounded-md border border-white/50 px-3 py-2 text-center text-xs font-semibold text-white">
                à propos
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/actualites" className="rounded-md border border-white/50 px-3 py-2 text-center text-xs font-semibold text-white">
                actualités
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/emploi" className="rounded-md border border-white/50 px-3 py-2 text-center text-xs font-semibold text-white">
                emploi
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} href="/annuaire" className="rounded-md border border-white/50 px-3 py-2 text-center text-xs font-semibold text-white">
                annuaire
              </Link>
              {isAuthenticated ? (
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/profil" className="col-span-2 rounded-md border border-[#f48988] px-3 py-2 text-center text-xs font-semibold text-[#f48988]">
                  profil
                </Link>
              ) : (
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/connexion" className="col-span-2 rounded-md border border-[#f48988] px-3 py-2 text-center text-xs font-semibold text-[#f48988]">
                  connexion
                </Link>
              )}
            </div>
          )}
        </div>
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
          <div className="max-w-4xl">
            <p className="text-base sm:text-lg text-[#3558A2] leading-relaxed">
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
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Nos Valeurs</h2>
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
          <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Nos Objectifs</h2>
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
      <section ref={partnersRef} className="py-4 bg-[#ffe8e4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            {/* <div className="flex items-center justify-center w-12 h-12 bg-[#3558A2] text-white rounded-lg">
              <Globe className="h-6 w-6" />
            </div> */}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Nos Partenaires
            </h2>
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
