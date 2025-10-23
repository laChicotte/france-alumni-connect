"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { articles } from "@/lib/fake-data"
import type { Article } from "@/lib/fake-data"
import { Calendar, User, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function ActualitesPage() {
  type BaseCategory = Article["category"]
  type ArticleCategory = BaseCategory | "Tous"
  const baseCategories: BaseCategory[] = Array.from(new Set(articles.map((a) => a.category)))
  const categories: ArticleCategory[] = ["Tous", ...baseCategories]
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>("Tous")
  const filteredArticles =
    selectedCategory === "Tous"
      ? articles
      : articles.filter((article) => article.category === selectedCategory)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0055A4] via-[#0055A4] to-[#003d7a] text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Actualités & Témoignages
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Découvrez les parcours inspirants de nos alumni, les opportunités d'entrepreneuriat et les événements du
              réseau France Alumni Guinée.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-muted border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className={
                  category === selectedCategory ? "bg-[#0055A4] hover:bg-[#0055A4]/90" : "hover:bg-[#0055A4] hover:text-white"
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative overflow-hidden">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-[#0055A4] text-white text-xs font-semibold rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
                <CardContent className="pt-6">
                  <h3 className="font-serif text-xl font-bold mb-3 line-clamp-2 group-hover:text-[#0055A4] transition-colors">
                    <Link href={`/actualites/${article.id}`}>{article.title}</Link>
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                  </div>
                  <Link
                    href={`/actualites/${article.id}`}
                    className="inline-flex items-center text-[#0055A4] font-semibold hover:underline"
                  >
                    Lire l'article
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Restez informé</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et opportunités du réseau.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background"
              />
              <Button className="bg-[#0055A4] hover:bg-[#0055A4]/90">S'abonner</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
