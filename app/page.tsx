"use client"

import { Card, CardContent } from "@/components/ui/card"
import { partners } from "@/lib/fake-data"
import { Users, Briefcase, MapPin } from "lucide-react"
import { useEffect, useRef, useState } from "react"

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const steps = Math.ceil(duration / 16)
    const increment = target / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

export default function HomePage() {
  type PublicPartner = { name: string; logo: string; site_web?: string | null }
  const [publicPartners, setPublicPartners] = useState<PublicPartner[]>(partners)
  const marqueePartners = [...publicPartners, ...publicPartners]

  const [totalAlumni, setTotalAlumni] = useState(0)
  const [totalEntrepreneurs, setTotalEntrepreneurs] = useState(0)
  const [totalReturned, setTotalReturned] = useState(0)
  const statsRef = useRef<HTMLElement | null>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  const countAlumni = useCountUp(statsVisible ? totalAlumni : 0)
  const countEntrepreneurs = useCountUp(statsVisible ? totalEntrepreneurs : 0)
  const countReturned = useCountUp(statsVisible ? totalReturned : 0)

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
    const loadStats = async () => {
      try {
        const res = await fetch("/api/annuaire/stats", { cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (!res.ok || !data) return
        setTotalAlumni(Number(data.totalAlumni) || 0)
        setTotalReturned(Number(data.dejaEnGuineeCount) || 0)
        const entrepreneurEntry = (data.statusData as { name: string; value: number }[] || [])
          .find((s) => s.name.toLowerCase().includes("entrepreneur"))
        setTotalEntrepreneurs(entrepreneurEntry?.value || 0)
      } catch {
        // silencieux
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    if (!statsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[320px] w-full overflow-hidden rounded-b-3xl sm:h-[420px] lg:h-[500px]">
        <img
          src="/apropos/apropos.jpg"
          alt="France Alumni Guinée"
          className="absolute inset-0 h-full w-full object-cover hero-zoom"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-center px-16 sm:px-32 lg:px-48">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <span className="inline-block bg-[#5B3FC8] px-4 py-2 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-5xl">
                Le réseau des
              </span>
            </div>
            <div>
              <span className="inline-block bg-[#1B8C7A] px-4 py-2 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-5xl">
                Étudiants-Entrepreneurs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-14 items-center">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img
                src="/apropos/nos_objectifs.jpeg"
                alt="France Alumni Guinée"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3558A2] mb-6 leading-tight">
                QUI SOMMES-<br />NOUS ?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                France Alumni Guinée, dans le prolongement de <strong>Campus France Guinée</strong>, est une
                communauté dynamique de Guinéennes et Guinéens diplômés de l&apos;enseignement français, rassemblés
                par leur parcours d&apos;études en France et leur engagement pour la coopération, le partage
                d&apos;expériences, la création d&apos;opportunités et l&apos;impact positif sur la Guinée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3558A2] text-center mb-8">
            Notre communauté
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="stat-card-1 flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-white">
              <Users className="h-14 w-14 opacity-90" strokeWidth={1.5} />
              <span className="text-5xl font-extrabold tracking-tight">{countAlumni.toLocaleString("fr-FR")}</span>
              <span className="text-center text-sm font-semibold uppercase tracking-widest opacity-90">Alumni</span>
            </div>
            <div className="stat-card-2 flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-white">
              <Briefcase className="h-14 w-14 opacity-90" strokeWidth={1.5} />
              <span className="text-5xl font-extrabold tracking-tight">{countEntrepreneurs.toLocaleString("fr-FR")}</span>
              <span className="text-center text-sm font-semibold uppercase tracking-widest opacity-90">Entrepreneurs</span>
            </div>
            <div className="stat-card-3 flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-white">
              <MapPin className="h-14 w-14 opacity-90" strokeWidth={1.5} />
              <span className="text-5xl font-extrabold tracking-tight">{countReturned.toLocaleString("fr-FR")}</span>
              <span className="text-center text-sm font-semibold uppercase tracking-widest opacity-90">Revenus en Guinée</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-10 bg-[#ffe8e4] mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
            <Card className="border-2 hover:border-[#3558A2] transition-colors bg-[#ffe8e4]">
              <CardContent className="pt-2">
                <h3 className="font-serif text-2xl font-bold mb-3 text-center">Solidarité</h3>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  Nous cultivons l'entraide et le soutien mutuel entre alumni pour favoriser la réussite collective.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-[#f48988] transition-colors bg-[#ffe8e4]">
              <CardContent className="pt-2">
                <h3 className="font-serif text-2xl font-bold mb-3 text-center">Excellence</h3>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  Nous promouvons l'excellence académique et professionnelle dans tous nos domaines d'intervention.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-[#3558A2] transition-colors bg-[#ffe8e4]">
              <CardContent className="pt-2">
                <h3 className="font-serif text-2xl font-bold mb-3 text-center">Engagement</h3>
                <p className="text-muted-foreground leading-relaxed text-justify">
                  Nous sommes engagés pour le développement durable et l'impact social positif en Guinée.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">1</div>
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">Représentation et influence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Valoriser la diaspora guinéenne diplômée de France et contribuer à un lobbying positif auprès des entreprises et institutions.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">2</div>
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">Développement local</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Promouvoir le transfert de compétences au service du développement en Guinée et renforcer les synergies avec les plateformes partenaires.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">3</div>
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">Solidarité et soutien</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Favoriser le mentorat, l'entraide et mobiliser les alumni autour d'initiatives citoyennes, éducatives et environnementales.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#3558A2] text-white rounded-full flex items-center justify-center font-bold">4</div>
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2">Rayonnement international</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Renforcer les liens entre la France et la Guinée et promouvoir l'excellence guinéenne à l'international.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-8">
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
        .hero-zoom {
          animation: zoom-breathe 10s ease-in-out infinite;
          transform-origin: center center;
        }
        @keyframes zoom-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }

        .stat-card-1 {
          background: linear-gradient(135deg, #3558A2 0%, #1e3a8a 100%);
        }
        .stat-card-2 {
          background: linear-gradient(135deg, #2563eb 0%, #3558A2 100%);
        }
        .stat-card-3 {
          background: linear-gradient(135deg, #1e3a8a 0%, #2d6ec7 100%);
        }

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
          .partners-marquee-item { width: 180px; }
        }
        .partners-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes partners-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 0.5rem)); }
        }
      `}</style>
    </div>
  )
}
