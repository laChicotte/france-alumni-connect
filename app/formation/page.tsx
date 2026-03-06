"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { User, Menu, X } from "lucide-react"

export default function FormationPage() {
  const [menuSolid, setMenuSolid] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    document.body.classList.add("hide-global-nav")
    return () => document.body.classList.remove("hide-global-nav")
  }, [])

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
      const progress = Math.min(Math.max(y / 260, 0), 1)
      const translateY = -120 * progress
      const opacity = 1 - progress

      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${translateY}px)`
        heroRef.current.style.opacity = String(opacity)
      }
      if (heroTitleRef.current) {
        heroTitleRef.current.style.opacity = String(opacity)
      }

      setMenuSolid(y > 220)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen">
      <style jsx global>{`
        body.hide-global-nav > nav {
          display: none !important;
        }
      `}</style>

      <div
        className={`fixed left-0 top-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-3 border-b transition-all duration-300 ${
          menuSolid ? "bg-white border-[#d9d9d9] shadow-sm" : "bg-transparent border-white/80"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img src="/logo/logo_alumni_bleu.png" alt="France Alumni Connect" className="h-10 w-auto object-contain" />
            <span
              className={`font-bold text-xl uppercase tracking-wide hidden sm:block ${
                menuSolid ? "text-[#3558A2]" : "text-white"
              }`}
              style={{
                letterSpacing: "0.05em",
                textShadow: menuSolid
                  ? "none"
                  : `
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
          <div className={`hidden md:flex items-center gap-6 ${menuSolid ? "text-[#3558A2]" : "text-white"}`}>
            <Link href="/a-propos" className="text-base font-semibold">à propos</Link>
            <Link href="/actualites" className="text-base font-semibold">actualités</Link>
            <Link href="https://talent-diaspora.fr/" target="_blank" rel="noopener noreferrer" className="text-base font-semibold">emploi</Link>
            <Link href="/formation" className="text-base font-semibold">formation</Link>
            <Link href="/annuaire" className="text-base font-semibold">annuaire</Link>
            {isAuthenticated ? (
              <Link
                href="/profil"
                className={`inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border ${
                  menuSolid ? "border-[#3558A2]" : "border-[#f48988]"
                }`}
              >
                {userPhotoUrl ? (
                  <img src={userPhotoUrl} alt="Photo de profil" className="h-full w-full object-cover" />
                ) : (
                  <User className={`h-4 w-4 ${menuSolid ? "text-[#3558A2]" : "text-[#f48988]"}`} />
                )}
              </Link>
            ) : (
              <Link
                href="/connexion"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                  menuSolid ? "border-[#3558A2]" : "border-[#f48988]"
                }`}
              >
                <User className={`h-4 w-4 ${menuSolid ? "text-[#3558A2]" : "text-[#f48988]"}`} />
              </Link>
            )}
          </div>
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border md:hidden ${
              menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
            }`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div
            className={`mx-auto mt-3 grid max-w-7xl grid-cols-2 gap-2 rounded-lg p-2 md:hidden ${
              menuSolid ? "border border-[#3558A2]/30 bg-white" : "border border-white/30 bg-[#1e2a5a]/80 backdrop-blur-sm"
            }`}
          >
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/a-propos" className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"}`}>
              à propos
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/actualites" className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"}`}>
              actualités
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="https://talent-diaspora.fr/" target="_blank" rel="noopener noreferrer" className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"}`}>
              emploi
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/formation" className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"}`}>
              formation
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="/annuaire" className={`col-span-2 rounded-md border px-3 py-2 text-center text-xs font-semibold ${menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"}`}>
              annuaire
            </Link>
          </div>
        )}
      </div>

      <section ref={heroRef} className="fixed left-0 top-0 z-10 h-[300px] w-full overflow-hidden sm:h-[350px]">
        <img src="/formation/formation.jpg" alt="Formation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex h-full max-w-7xl items-end px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <h1 ref={heroTitleRef} className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
            formation
          </h1>
        </div>
      </section>

      <div className="h-[300px] sm:h-[350px]" />

      <section className="bg-[#ffe8e4] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-[#3558A2] sm:text-4xl">
            A venir dans les prochaines mis à jour
          </h2>
        </div>
      </section>
    </div>
  )
}

