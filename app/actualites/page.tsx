"use client"

import Image from "next/image"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { articles } from "@/lib/fake-data"
import { Calendar, User, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

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

  return (
    <div className="min-h-screen">
      {/* Hero image */}
      <section className="relative mx-4 mt-4 h-[320px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[420px] lg:mx-8 lg:h-[520px]">
        <Image src="/actualites/actualites1.jpg" alt="Actualités" fill className="object-cover hero-zoom" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-10 px-10 sm:pb-14 sm:px-20 lg:pb-16 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl lg:text-4xl">
            actualités
          </h1>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-6 border-b">
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
      <section className="py-10">
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
      <section className="py-10 bg-[#ffe8e4]">
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
                className="h-10 flex-1 rounded-lg border border-input bg-background px-4"
              />
              <Button className="h-10 bg-[#3558A2] hover:bg-[#3558A2]/90">S'abonner</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}