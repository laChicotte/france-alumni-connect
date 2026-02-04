"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { articles } from "@/lib/fake-data"
import type { Article } from "@/lib/fake-data"
import { Calendar, User, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export default function ActualitesPage() {
  type BaseCategory = Article["category"]
  type ArticleCategory = BaseCategory | "Tous"
  const baseCategories: BaseCategory[] = Array.from(new Set(articles.map((a) => a.category)))
  const categories: ArticleCategory[] = ["Tous", ...baseCategories]
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>("Tous")
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 8

  const filteredArticles =
    selectedCategory === "Tous"
      ? articles
      : articles.filter((article) => article.category === selectedCategory)

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const currentArticles = filteredArticles.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4 lg:py-6">
        <div className="w-full px-2 sm:px-4 flex flex-col items-center">
          <div className="max-w-3xl text-center">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Actualités & Témoignages
            </h1>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-6 bg-[#ffe8e4] border-b">
        <div className="max-w-[85%] mx-auto px-2 sm:px-4">
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
                onClick={() => {
                  setSelectedCategory(category)
                  setCurrentPage(1)
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-6">
        <div className="max-w-[85%] mx-auto px-2 sm:px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentArticles.map((article) => (
              <Link key={article.id} href={`/actualites/${article.id}`}>
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
                  <CardContent className="pt-6">
                    <h3 className="font-serif text-lg font-bold mb-3 line-clamp-2 group-hover:text-[#3558A2] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">{article.excerpt}</p>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-2">
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