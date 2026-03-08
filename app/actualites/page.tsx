"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { articles } from "@/lib/fake-data"
import { Calendar, User, ChevronLeft, ChevronRight, Menu, X, Loader2, Shield } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type FeedItem = {
  id: string
  title: string
  image: string
  category: string
  author: string
  date: string
  href: string
}

export default function ActualitesPage() {
  const fallbackItems: FeedItem[] = articles.map((article) => ({
    id: article.id,
    title: article.title,
    image: article.image || "/placeholder.svg",
    category: article.category,
    author: article.author,
    date: article.date,
    href: `/actualites/${article.id}`,
  }))
  const [feedItems, setFeedItems] = useState<FeedItem[]>(fallbackItems)
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingFeed, setIsLoadingFeed] = useState(true)
  const [menuSolid, setMenuSolid] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const heroRef = useRef<HTMLElement | null>(null)
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null)
  const articlesPerPage = 6
  const categories = ["Tous", ...Array.from(new Set(feedItems.map((item) => item.category)))]

  const filteredArticles =
    selectedCategory === "Tous"
      ? feedItems
      : feedItems.filter((item) => item.category === selectedCategory)

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const currentArticles = filteredArticles.slice(startIndex, endIndex)

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
        setUserRole(parsedUser.role || "")
      } catch {
        setUserPhotoUrl(null)
        setUserRole("")
      }
    }
  }, [])
  const isAdminOrModerator = userRole === "admin" || userRole === "moderateur"

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await fetch("/api/actualites/feed", { cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (res.ok && Array.isArray(data?.items) && data.items.length > 0) {
          setFeedItems(data.items as FeedItem[])
        }
      } catch {
        // fallback silencieux vers les données locales
      } finally {
        setIsLoadingFeed(false)
      }
    }

    loadFeed()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

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
            {isAuthenticated && isAdminOrModerator && (
              <Link href="/admin" className={`inline-flex items-center gap-1.5 text-base font-semibold ${menuSolid ? "text-[#3558A2]" : "text-[#fcd116]"}`}>
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
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
            {isAuthenticated && isAdminOrModerator && (
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/admin"
                className={`col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-center text-xs font-semibold ${
                  menuSolid ? "border-[#3558A2]/40 text-[#3558A2]" : "border-[#fcd116] text-[#fcd116]"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
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
        <img src="/actualites/actualites.jpg" alt="Actualités" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex h-full max-w-7xl items-end px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <h1 ref={heroTitleRef} className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-none">
            actualités
          </h1>
        </div>
      </section>

      {/* Spacer du hero */}
      <div className="h-[300px] sm:h-[350px]" />

      {/* Categories Filter */}
      <section className="py-6 bg-[#ffe8e4] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className={
                  category === "Événements"
                    ? category === selectedCategory
                      ? "bg-[#fcd116] text-black hover:bg-[#fcd116]/90"
                      : "border-[#fcd116] bg-[#fcd116]/20 text-foreground hover:bg-[#fcd116]/40 hover:text-black"
                    : category === selectedCategory
                      ? "bg-[#3558A2] hover:bg-[#3558A2]/90"
                      : "hover:bg-[#3558A2] hover:text-white"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoadingFeed ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#3558A2]" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentArticles.map((article) => (
                <Link key={article.id} href={article.href}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full cursor-pointer">
                    <div className="relative overflow-hidden">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 bg-[#3558A2] text-white text-xs font-semibold rounded-full">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="pt-2">
                      <h3 className="font-serif text-lg font-bold mb-3 line-clamp-2 group-hover:text-[#3558A2] transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{article.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{article.author}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="hidden gap-2 sm:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={
                      currentPage === page
                        ? "bg-[#3558A2] hover:bg-[#3558A2]/90"
                        : "hover:bg-[#3558A2] hover:text-white"
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground sm:hidden">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-4 bg-[#ffe8e4]">
        <div className="w-full px-2 sm:px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Restez informé</h2>
            <p className="text-lg text-muted-foreground mb-3">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et opportunités du réseau.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background"
              />
              <Button className="bg-[#3558A2] hover:bg-[#3558A2]/90">S'abonner</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}