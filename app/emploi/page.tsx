"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, Clock, Calendar, Search, User, Menu, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

// Données d'exemple pour les offres d'emploi
const jobOffers = [
  {
    id: 1,
    title: "Ingénieur Logiciel Senior",
    company: "Tech Guinée",
    location: "Conakry, Guinée",
    type: "CDI",
    category: "Informatique",
    date: "Publié il y a 2 jours",
    description: "Nous recherchons un ingénieur logiciel expérimenté pour rejoindre notre équipe.",
  },
  {
    id: 2,
    title: "Chef de Projet Marketing",
    company: "Marketing Plus",
    location: "Conakry, Guinée",
    type: "CDI",
    category: "Marketing",
    date: "Publié il y a 1 semaine",
    description: "Recherche d'un chef de projet marketing dynamique et créatif.",
  },
  {
    id: 3,
    title: "Consultant Finance",
    company: "Finance Conseil",
    location: "Conakry, Guinée",
    type: "CDD",
    category: "Finance",
    date: "Publié il y a 3 jours",
    description: "Cabinet de conseil recherche consultant en finance.",
  },
  {
    id: 4,
    title: "Professeur de Français",
    company: "Institut Français de Guinée",
    location: "Conakry, Guinée",
    type: "CDI",
    category: "Éducation",
    date: "Publié il y a 5 jours",
    description: "Enseignement du français langue étrangère.",
  },
]

export default function EmploiPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [selectedType, setSelectedType] = useState("Tous")
  const [selectedLocation, setSelectedLocation] = useState("Tous")
  const [menuSolid, setMenuSolid] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null)

  const { categories, types, locations } = useMemo(() => {
    const categorySet = new Set(jobOffers.map((job) => job.category))
    const typeSet = new Set(jobOffers.map((job) => job.type))
    const locationSet = new Set(jobOffers.map((job) => job.location))

    return {
      categories: ["Tous", ...Array.from(categorySet)],
      types: ["Tous", ...Array.from(typeSet)],
      locations: ["Tous", ...Array.from(locationSet)],
    }
  }, [])

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return jobOffers.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.company.toLowerCase().includes(normalizedSearch) ||
        job.location.toLowerCase().includes(normalizedSearch) ||
        job.category.toLowerCase().includes(normalizedSearch) ||
        job.type.toLowerCase().includes(normalizedSearch)

      const matchesCategory = selectedCategory === "Tous" || job.category === selectedCategory
      const matchesType = selectedType === "Tous" || job.type === selectedType
      const matchesLocation = selectedLocation === "Tous" || job.location === selectedLocation

      return matchesSearch && matchesCategory && matchesType && matchesLocation
    })
  }, [searchTerm, selectedCategory, selectedType, selectedLocation])

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

      {/* Menu local superposé */}
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
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/a-propos"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              à propos
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/actualites"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              actualités
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="https://talent-diaspora.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              emploi
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/formation"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              formation
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              href="/annuaire"
              className={`rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-white/50 text-white"
              }`}
            >
              annuaire
            </Link>
            {isAuthenticated ? (
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/profil"
                className={`col-span-2 rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                  menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-[#f48988] text-[#f48988]"
                }`}
              >
                profil
              </Link>
            ) : (
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/connexion"
                className={`col-span-2 rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                  menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-[#f48988] text-[#f48988]"
                }`}
              >
                connexion
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Hero image */}
      <section ref={heroRef} className="fixed left-0 top-0 z-10 h-[300px] w-full overflow-hidden sm:h-[350px]">
        <img src="/emploi/emploi.jpg" alt="Emploi" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex h-full max-w-7xl items-end px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <h1 ref={heroTitleRef} className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
            emploi
          </h1>
        </div>
      </section>

      <div className="h-[300px] sm:h-[350px]" />

      {/* Recherche et filtres */}
      <section className="py-4 bg-[#ffe8e4] border-b border-[#d9d9d9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="bg-white rounded-lg p-1 flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-2 px-3 w-full sm:w-72">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Poste, entreprise, lieu..."
                  className="flex-1 outline-none text-foreground"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Button className="bg-[#3558A2] hover:bg-[#3558A2]/90">
                Rechercher
              </Button>
            </div>

            <div className="flex w-full flex-col lg:w-auto">
              <label className="text-sm font-medium mb-1">Secteur</label>
              <select
                className="bg-white rounded-md border border-input px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex w-full flex-col lg:w-auto">
              <label className="text-sm font-medium mb-1">Type de contrat</label>
              <select
                className="bg-white rounded-md border border-input px-3 py-2 text-sm"
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex w-full flex-col lg:w-auto">
              <label className="text-sm font-medium mb-1">Ville</label>
              <select
                className="bg-white rounded-md border border-input px-3 py-2 text-sm"
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="inline-block px-3 py-1 bg-[#3558A2] text-white text-xs font-semibold rounded-full mb-3">
                      {job.category}
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-[#3558A2] transition-colors">
                      {job.title}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{job.date}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <Button className="w-full bg-[#3558A2] hover:bg-[#3558A2]/90">
                    Voir l&apos;offre
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4 bg-[#ffe8e4]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">Vous recrutez ?</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            Publiez vos offres d&apos;emploi et trouvez les meilleurs talents du réseau France Alumni Guinée.
          </p>
          <Button size="lg" className="w-full sm:w-auto bg-[#ea292c] hover:bg-[#f48988]/90 font-semibold">
            Publier une offre
          </Button>
        </div>
      </section>
    </div>
  )
}
