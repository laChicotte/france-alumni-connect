"use client"

import { Card, CardContent } from "@/components/ui/card"
import { partners } from "@/lib/fake-data"
import { Users, Briefcase, MapPin, Trophy, Network, Target, Play } from "lucide-react"
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
  const presentationVideoId = "ErNrCZvUS8k"
  const presentationThumbnail = "/accueil/miniature.jpeg"
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
  const [entrepreneurPercentage, setEntrepreneurPercentage] = useState(0)
  const [activeQuiSommesNousImageIndex, setActiveQuiSommesNousImageIndex] = useState(0)
  const [isPresentationPlaying, setIsPresentationPlaying] = useState(false)
  const statsRef = useRef<HTMLElement | null>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  const countAlumni = useCountUp(statsVisible ? totalAlumni : 0)
  const countEntrepreneurPercentage = useCountUp(statsVisible ? entrepreneurPercentage : 0)
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
        } | null
        setEntrepreneurPercentage(Number(percentages?.entrepreneurs) || 0)
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
    if (quiSommesNousImages.length < 2) return
    const timer = setInterval(() => {
      setActiveQuiSommesNousImageIndex((prev) => (prev + 1) % quiSommesNousImages.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [quiSommesNousImages.length])
  const activeQuiSommesNousImage =
    quiSommesNousImages[activeQuiSommesNousImageIndex] || quiSommesNousImages[0]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative mx-4 mt-4 h-[380px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[500px] lg:mx-8 lg:h-[620px]">
        <img
          // src="/apropos/apropos.jpg"
          src="/accueil/accueil2.jpeg"
          alt="France Alumni Guinée"
          className="absolute inset-0 h-full w-full object-cover hero-zoom"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-center px-5 sm:px-15 lg:px-48">
          <div className="flex flex-col gap-1 sm:gap-4">
            <div>
              <span className="hero-title-line hero-title-top inline-block bg-[#3558A2] px-4 py-2 font-bold leading-tight text-white lg:text-5xl">
                Le réseau des
              </span>
            </div>
            <div>
              <span className="hero-title-line hero-title-bottom inline-block bg-[#da281c] px-4 py-2 font-bold leading-tight text-white lg:text-5xl">
                Guinéens diplômés de France
              </span>
            </div>
          </div>
        </div>
        <div className="hero-affiliate-badge absolute bottom-3 right-3 z-20 sm:bottom-6 sm:right-8">
          <div className="flex items-start gap-1.5 sm:gap-2.5">
            
            <span className="inline-flex rounded-sm px-2 py-1 text-[10px] font-bold lowercase tracking-wide text-white sm:px-4 sm:py-2.5 sm:text-sm">
              en lien avec
            </span>

            <div className="h-10 w-[2px] bg-white/90 sm:h-22" aria-hidden="true" />

            <img
              src="/accueil/ambassade.png"
              alt="Ambassade de France en Guinée et en Sierra Leone"
              className="h-10 w-auto object-contain sm:h-[5.5rem]"
            />
            
          </div>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section className="lg:py-28 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <h2 className="block lg:hidden font-serif text-4xl font-bold text-[#3558A2] mb-6 leading-tight text-center">
            qui sommes-<br />nous ?
          </h2>
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-14 items-center">
            <div className="order-2 lg:order-1 mx-auto w-[calc(100%-5px)] overflow-hidden rounded-lg shadow-lg h-[400px] sm:h-[500px] lg:h-[750px]">
              <img
                src={activeQuiSommesNousImage}
                alt="France Alumni Guinée"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2 ml-0 lg:ml-18">
              <h2 className="hidden lg:block font-serif text-4xl lg:text-6xl font-bold text-[#3558A2] mb-6 leading-tight">
                qui sommes-<br />nous ?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed text-left">
                France Alumni Guinée rassemble une communauté dynamique de Guinéennes et Guinéens diplômés de l&apos;enseignement 
                supérieur français. 
                <br />
                <br />
                Service de l&apos;Institut français, rattaché à l&apos;Ambassade de France en Guinée et
                prolongement de l&apos;expérience Campus France, France Alumni est un réseau engagé et résolument tourné vers l&apos;avenir. Fondé sur des
                valeurs de solidarité, d&apos;entraide et d&apos;engagement, cette communauté favorise les échanges entre ses membres, 
                soutient les initiatives collectives et met en lumière les parcours des alumni.
                <br />
                <br />
                Plus qu&apos;un simple réseau, France Alumni Guinée constitue un véritable espace d'échanges et d'opportunités : 
                un trait d&apos;union vivant entre la Guinée et la France, au service de la coopération, de l&apos;innovation
                et de la mobilité.
              </p>
              <div className="mt-10 flex justify-end">
                <a
                  href="https://drive.google.com/file/d/1v4PrnKUW_eTmPXP5X03zGinuCYAWjz6I/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-[#3558A2]/20 bg-[#eef2fb] px-4 py-2.5 text-sm font-medium text-[#3558A2] shadow-sm transition-colors hover:bg-[#e4eaf8] hover:border-[#3558A2]/30"
                >
                  visa de circulation dédié aux Alumni
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Objectives */}
      <section className="py-14 bg-[#da281c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#ffffff] text-center mb-12">
            nos objectifs
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-28 gap-10">
            <div>
              <h3 className="mb-3 inline-flex items-center gap-2 font-serif text-xl font-bold text-white sm:text-2xl">
                <Trophy className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
                valoriser
              </h3>
              <p
                lang="fr"
                className="text-white sm:text-lg leading-relaxed max-w-md"
              >
                Mettre en lumière les talents et réussites guinéennes, renforcer la visibilité du réseau et porter une voix structurée 
                capable d&apos;influencer entreprises et institutions.
              </p>
            </div>
            <div>
              <h3 className="mb-3 inline-flex items-center gap-2 font-serif text-xl font-bold text-white sm:text-2xl">
                <Network className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
                connecter
              </h3>
              <p
                lang="fr"
                className="text-white sm:text-lg leading-relaxed max-w-md"
              >
                Organiser des temps d'échanges, créer du lien et associer des compétences complémentaires pour imaginer de nouvelles opportunités ensemble.
              </p>
            </div>
            <div>
              <h3 className="mb-3 inline-flex items-center gap-2 font-serif text-xl font-bold text-white sm:text-2xl">
                <Target className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
                impacter
              </h3>

              <p
                lang="fr"
                className="text-white sm:text-lg leading-relaxed max-w-md"
              >
                Susciter des initiatives ambitieuses pour agir concrètement sur le développement local : accompagner les entrepreneurs, soutenir 
                des projets à fort impact et répondre aux besoins du terrain.
              </p>
            </div>
  
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3558A2] text-center mb-8">
              le réseau en bref
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card-video relative min-h-[220px] overflow-hidden rounded-2xl p-[18px] text-white sm:min-h-[250px]">
              {!isPresentationPlaying ? (
                <button
                  type="button"
                  onClick={() => setIsPresentationPlaying(true)}
                  className="group relative block w-full h-full overflow-hidden rounded-xl"
                  aria-label="Lire la vidéo de présentation"
                >
                  <img
                    src={presentationThumbnail}
                    alt="Miniature de la vidéo de présentation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/45" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#3558A2] shadow">
                      <Play className="h-4 w-4 fill-current" />
                      Lire la vidéo
                    </span>
                  </span>
                </button>
              ) : (
                <iframe
                  className="absolute inset-[18px] h-[calc(100%-36px)] w-[calc(100%-36px)] rounded-xl"
                  src={`https://www.youtube-nocookie.com/embed/${presentationVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title="Vidéo de présentation France Alumni Guinée"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              )}
            </div>
            <div className="stat-card-1 flex min-h-[220px] flex-col items-center justify-center gap-5 rounded-2xl p-10 text-white sm:min-h-[250px]">
              <Users className="h-16 w-16 opacity-90 sm:h-[4.5rem] sm:w-[4.5rem]" strokeWidth={1.5} />
              <span className="text-7xl font-extrabold tracking-tight sm:text-8xl">{countAlumni.toLocaleString("fr-FR")}</span>
              <span className="text-center text-base font-semibold uppercase tracking-widest opacity-90">Alumni</span>
            </div>
            <div className="stat-card-2 flex min-h-[220px] flex-col items-center justify-center gap-5 rounded-2xl p-10 text-white sm:min-h-[250px]">
              <Briefcase className="h-16 w-16 opacity-90 sm:h-[4.5rem] sm:w-[4.5rem]" strokeWidth={1.5} />
              <span className="text-7xl font-extrabold tracking-tight sm:text-8xl">
                {`${countEntrepreneurPercentage}%`}
              </span>
              <span className="text-center text-base font-semibold uppercase tracking-widest opacity-90">
                Entrepreneurs
              </span>
            </div>
            <div className="stat-card-3 flex min-h-[220px] flex-col items-center justify-center gap-5 rounded-2xl p-10 text-white sm:min-h-[250px]">
              <MapPin className="h-16 w-16 opacity-90 sm:h-[4.5rem] sm:w-[4.5rem]" strokeWidth={1.5} />
              <span className="text-7xl font-extrabold tracking-tight sm:text-8xl">{countReturned.toLocaleString("fr-FR")}</span>
              <span className="text-center text-base font-semibold uppercase tracking-widest opacity-90">Déjà en Guinée</span>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="lg:pb-12 lg:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-0 lg:gap-6">
            <div className="mt-4 w-36 flex-shrink-0 self-start text-left sm:mt-6 lg:mt-0 lg:w-48">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#da281c] leading-none">
                nos <br />partenaires
              </h2>
            </div>
            <div className="w-full lg:flex-1 max-w-[720px] overflow-hidden lg:ml-45">
              <div className="partners-marquee-track">
                {marqueePartners.map((partner, index) => (
                  <div key={`${partner.name}-${index}`} className="partners-marquee-item">
                    <img
                      src={partner.logo || "/placeholder.svg"}
                      alt={partner.name}
                      className="h-28 w-full object-contain opacity-85 transition-opacity duration-200 hover:opacity-100 sm:h-64"
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
          background: #3558A2;
        }
        .stat-card-2 {
          background: #3558A2;
        }
        .stat-card-3 {
          background: #3558A2;
        }
        .stat-card-video {
          background: #3558A2;
        }

        .partners-marquee-track {
          display: flex;
          gap: 0;
          width: max-content;
          animation: partners-marquee-scroll 34s linear infinite;
          will-change: transform;
        }
        .partners-marquee-item {
          width: 105px;
          flex: 0 0 auto;
          margin: 0;
          padding: 0;
        }
        @media (min-width: 768px) {
          .partners-marquee-item { width: 145px; }
        }
        @media (min-width: 1024px) {
          .partners-marquee-item { width: 170px; }
        }
        .partners-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes partners-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 0.03rem)); }
        }
      `}</style>
    </div>
  )
}
