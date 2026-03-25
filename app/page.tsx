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
  type ProfessionalShare = { label: string; value: number }
  const quiSommesNousImages = [
    "/accueil/quisommesnous/a.jpg",
    "/accueil/quisommesnous/b.jpg",
    "/accueil/quisommesnous/c.jpg",
    "/accueil/quisommesnous/d.jpg",
  ]
  const [publicPartners, setPublicPartners] = useState<PublicPartner[]>(partners)
  const marqueePartners = [...publicPartners, ...publicPartners]

  const [totalAlumni, setTotalAlumni] = useState(0)
  const [totalReturned, setTotalReturned] = useState(0)
  const [professionalShares, setProfessionalShares] = useState<ProfessionalShare[]>([
    { label: "Entrepreneurs", value: 0 },
    { label: "Salariés", value: 0 },
    { label: "Dirigeants", value: 0 },
  ])
  const [activeProfessionalShareIndex, setActiveProfessionalShareIndex] = useState(0)
  const [activeQuiSommesNousImageIndex, setActiveQuiSommesNousImageIndex] = useState(0)
  const statsRef = useRef<HTMLElement | null>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  const countAlumni = useCountUp(statsVisible ? totalAlumni : 0)
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
        const percentages = data.professionalPercentages as {
          entrepreneurs?: number
          salaries?: number
          dirigeants?: number
        } | null
        setProfessionalShares([
          { label: "Entrepreneurs", value: Number(percentages?.entrepreneurs) || 0 },
          { label: "Salariés", value: Number(percentages?.salaries) || 0 },
          { label: "Dirigeants", value: Number(percentages?.dirigeants) || 0 },
        ])
        setActiveProfessionalShareIndex(0)
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

  useEffect(() => {
    if (!statsVisible || professionalShares.length < 2) return
    const timer = setInterval(() => {
      setActiveProfessionalShareIndex((prev) => (prev + 1) % professionalShares.length)
    }, 2400)
    return () => clearInterval(timer)
  }, [statsVisible, professionalShares])

  useEffect(() => {
    if (quiSommesNousImages.length < 2) return
    const timer = setInterval(() => {
      setActiveQuiSommesNousImageIndex((prev) => (prev + 1) % quiSommesNousImages.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [quiSommesNousImages.length])

  const activeProfessionalShare = professionalShares[activeProfessionalShareIndex] || professionalShares[0]
  const activeQuiSommesNousImage =
    quiSommesNousImages[activeQuiSommesNousImageIndex] || quiSommesNousImages[0]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative mx-4 mt-4 h-[380px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[500px] lg:mx-8 lg:h-[620px]">
        <img
          // src="/apropos/apropos.jpg"
          src="/accueil/accueil1.jpeg"
          alt="France Alumni Guinée"
          className="absolute inset-0 h-full w-full object-cover hero-zoom"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-center px-16 sm:px-32 lg:px-48">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <span className="hero-title-line hero-title-top inline-block bg-[#3558A2] px-4 py-2 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-5xl">
                Le réseau des
              </span>
            </div>
            <div>
              <span className="hero-title-line hero-title-bottom inline-block bg-[#da281c] px-4 py-2 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-5xl">
                Guinéens diplômés de France
              </span>
            </div>
          </div>
        </div>
        <div className="hero-affiliate-badge absolute bottom-4 right-4 z-20 sm:bottom-6 sm:right-8">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="inline-flex rounded-sm px-3 py-2 text-[11px] font-bold lowercase tracking-wide text-white sm:text-xs">
              en lien avec
            </span>
            <div className="h-12 w-px bg-white/90 sm:h-14" aria-hidden="true" />
            <img
              src="/accueil/ambassade.png"
              alt="Ambassade de France en Guinée et en Sierra Leone"
              className="h-14 w-auto object-contain sm:h-16"
            />
          </div>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-14 items-center">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img
                src={activeQuiSommesNousImage}
                alt="France Alumni Guinée"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3558A2] mb-6 leading-tight">
                qui sommes-<br />nous ?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-justify">
                France Alumni Guinée, dans le prolongement de Campus France, est une communauté dynamique de 
                Guinéennes et Guinéens diplômés de l&apos;enseignement supérieur français, rassemblés par leur 
                parcours d&apos;études en France et leur engagement pour la coopération, le partage d&apos;expériences, 
                la création d&apos;opportunités et l&apos;impact positif sur la Guinée. Portée par des valeurs de 
                solidarité et d&apos;entraide, la communauté encourage le soutien mutuel entre ses membres afin de 
                favoriser la réussite collective et de faire émerger des projets porteurs d&apos;avenir.
                <br />
                <br />
              
                Portée par des valeurs de solidarité et d&apos;entraide, la communauté encourage le soutien mutuel 
                entre ses membres afin de favoriser la réussite collective et de faire émerger des projets porteurs 
                d&apos;avenir.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Objectives */}
      <section className="py-14 bg-[#da281c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#ffffff] text-center mb-12">
            nos objectifs
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-30">
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">représentation et <br />influence</h3>
              <p className="objectives-justified text-white text-sm leading-7" lang="fr">
                Fédérer la diaspora guinéenne diplômée de France autour d&apos;une voix structurée, capable de dialoguer avec les entreprises et institutions. L&apos;objectif est de créer des passerelles concrètes vers l&apos;emploi, les partenariats et les opportunités économiques.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">développement <br />local</h3>
              <p className="objectives-justified text-white text-sm leading-7" lang="fr">
                Mobiliser les compétences pour répondre à des besoins précis en Guinée : accompagnement d&apos;entrepreneurs, interventions d&apos;experts, programmes de formation et appui à des projets à fort impact.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">solidarité et <br />soutien</h3>
              <p className="objectives-justified text-white text-sm leading-7" lang="fr">
                Structurer un réseau d&apos;entraide efficace basé sur le mentorat, le partage d&apos;expériences et l&apos;accès à des ressources utiles, afin d&apos;accompagner les parcours professionnels et encourager l&apos;engagement collectif.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">rayonnement <br />international</h3>
              <p className="objectives-justified text-white text-sm leading-7" lang="fr">
                Mettre en lumière les réussites guinéennes et développer des connexions stratégiques entre la France et la Guinée pour favoriser les collaborations, l&apos;attractivité et la reconnaissance du réseau.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3558A2] text-center mb-8">
              le réseau en bref
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="stat-card-1 flex min-h-[220px] flex-col items-center justify-center gap-5 rounded-2xl p-10 text-white sm:min-h-[250px]">
              <Users className="h-16 w-16 opacity-90 sm:h-[4.5rem] sm:w-[4.5rem]" strokeWidth={1.5} />
              <span className="text-6xl font-extrabold tracking-tight sm:text-7xl">{countAlumni.toLocaleString("fr-FR")}</span>
              <span className="text-center text-base font-semibold uppercase tracking-widest opacity-90">Alumni</span>
            </div>
            <div className="stat-card-2 flex min-h-[220px] flex-col items-center justify-center gap-5 rounded-2xl p-10 text-white sm:min-h-[250px]">
              <Briefcase className="h-16 w-16 opacity-90 sm:h-[4.5rem] sm:w-[4.5rem]" strokeWidth={1.5} />
              <span key={`share-value-${activeProfessionalShareIndex}`} className="stat-rotate-in text-6xl font-extrabold tracking-tight sm:text-7xl">
                {`${activeProfessionalShare.value}%`}
              </span>
              <span key={`share-label-${activeProfessionalShareIndex}`} className="stat-rotate-in text-center text-base font-semibold uppercase tracking-widest opacity-90">
                {activeProfessionalShare.label}
              </span>
            </div>
            <div className="stat-card-3 flex min-h-[220px] flex-col items-center justify-center gap-5 rounded-2xl p-10 text-white sm:min-h-[250px]">
              <MapPin className="h-16 w-16 opacity-90 sm:h-[4.5rem] sm:w-[4.5rem]" strokeWidth={1.5} />
              <span className="text-6xl font-extrabold tracking-tight sm:text-7xl">{countReturned.toLocaleString("fr-FR")}</span>
              <span className="text-center text-base font-semibold uppercase tracking-widest opacity-90">Déjà en Guinée</span>
            </div>
          </div>
        </div>
      </section>

      

      {/* Partners */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex-shrink-0 w-36 lg:w-48">
              <h2 className="font-serif text-xl lg:text-3xl font-bold text-[#da281c] leading-snug">
                Nos <br />partenaires
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="partners-marquee-track">
                {marqueePartners.map((partner, index) => (
                  <div key={`${partner.name}-${index}`} className="partners-marquee-item">
                    <img
                      src={partner.logo || "/placeholder.svg"}
                      alt={partner.name}
                      className="h-32 w-full object-contain opacity-85 transition-opacity duration-200 hover:opacity-100 sm:h-40"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-zoom {
          animation: zoom-breathe 10s ease-in-out infinite;
          transform-origin: center center;
        }
        .hero-title-line {
          will-change: transform, opacity;
          animation-duration: 1900ms;
          animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
          animation-fill-mode: both;
        }
        .hero-title-top {
          animation-name: hero-enter-top;
        }
        .hero-title-bottom {
          animation-name: hero-enter-bottom;
          animation-delay: 120ms;
        }
        @keyframes zoom-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }
        @keyframes hero-enter-top {
          from {
            transform: translateY(-70px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes hero-enter-bottom {
          from {
            transform: translateY(70px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .hero-affiliate-badge {
          animation: badge-float 6.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-title-line {
            animation: none;
          }
        }
        @keyframes badge-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
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
        .objectives-justified {
          text-align: justify;
          text-justify: inter-word;
          text-align-last: left;
          hyphens: auto;
          overflow-wrap: break-word;
        }
        .stat-rotate-in {
          animation: stat-fade-in 420ms ease;
        }
        @keyframes stat-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .partners-marquee-track {
          display: flex;
          gap: 0.1rem;
          width: max-content;
          animation: partners-marquee-scroll 34s linear infinite;
          will-change: transform;
        }
        .partners-marquee-item {
          width: 88px;
          flex: 0 0 auto;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 768px) {
          .partners-marquee-item { width: 130px; }
        }
        @media (min-width: 1024px) {
          .partners-marquee-item { width: 220px; }
        }
        .partners-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes partners-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 0.05rem)); }
        }
      `}</style>
    </div>
  )
}
