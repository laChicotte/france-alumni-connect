"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { articles } from "@/lib/fake-data"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function ArticlePage() {
  const params = useParams()
  const article = articles.find((a) => a.id === params.id as string)

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Article non trouvé</h1>
          <Link href="/actualites">
            <Button>Retour aux actualités</Button>
          </Link>
        </div>
      </div>
    )
  }

  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

  return (
    <div className="min-h-screen">
       {/* Hero Section */}
        <section className="py-3 lg:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <Link href="/actualites">
            <Button variant="ghost" className="mb-2 hover:bg-[#f48988] bg-[#3558A2]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux actualités
            </Button>
            </Link>

            <div className="max-w-4xl">
            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full mb-2 bg-[#f48988]">
                {article.category}
            </span>

            <h1 className="font-serif text-2xl sm:text-2xl lg:text-3xl font-bold mb-2 whitespace-nowrap">
                {article.title}
            </h1>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{article.date}</span>
                </div>
            </div>
            </div>
        </div>
        </section>


      {/* Article Content */}
      <section className="py-4 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {article.category === "Événements" && !showRegistrationForm ? (
            <div className="space-y-8">
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="prose max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">{article.excerpt}</p>
                <div className="space-y-4 text-foreground">
                  <p>{article.content}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                    ex ea commodo consequat.
                  </p>
                  <h3 className="font-serif text-xl font-bold mt-6 mb-3">Détails de l'événement</h3>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                    laborum.
                  </p>
                </div>
              </div>
              <div className="pt-8 border-t">
                <Button
                  onClick={() => setShowRegistrationForm(true)}
                  size="lg"
                  className="bg-[#3558A2] hover:bg-[#3558A2]/90"
                >
                  S'inscrire à cet événement
                </Button>
              </div>
            </div>
          ) : article.category === "Événements" && showRegistrationForm ? (
            <div className="space-y-6">
              <div className="p-6 bg-muted rounded-lg">
                <h2 className="font-serif text-2xl font-bold mb-2">Inscription à l'événement</h2>
                <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                <p className="text-muted-foreground">{article.date}</p>
              </div>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  alert("Inscription confirmée !")
                  setShowRegistrationForm(false)
                }}
              >
                <div>
                  <Label htmlFor="name" className="mb-2 block">Nom complet *</Label>
                  <Input id="name" placeholder="Votre nom complet" required />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2 block">Email *</Label>
                  <Input id="email" type="email" placeholder="votre.email@exemple.com" required />
                </div>
                <div>
                  <Label htmlFor="phone" className="mb-2 block">Téléphone</Label>
                  <Input id="phone" type="tel" placeholder="+224 XXX XX XX XX" />
                </div>
                <div>
                  <Label htmlFor="company" className="mb-2 block">Entreprise/Organisation</Label>
                  <Input id="company" placeholder="Votre entreprise" />
                </div>
                <div>
                  <Label htmlFor="message" className="mb-2 block">Message (optionnel)</Label>
                  <Textarea id="message" placeholder="Questions ou commentaires..." rows={4} />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegistrationForm(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#3558A2] hover:bg-[#3558A2]/90">
                    Confirmer l'inscription
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="prose max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">{article.excerpt}</p>
                <div className="space-y-4 text-foreground">
                  <p>{article.content}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                    ex ea commodo consequat.
                  </p>
                  <h3 className="font-serif text-xl font-bold mt-6 mb-3">Un parcours inspirant</h3>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                    laborum.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
