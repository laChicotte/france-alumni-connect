"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, Clock, Calendar, Search, Filter } from "lucide-react"
import { useMemo, useState } from "react"

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="lg:py-2">
        <div className="max-w-[85%] mx-auto px-2 sm:px-4">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
              Offres d&apos;Emploi
            </h1>
            <p className="text-lg">
              Découvrez les opportunités professionnelles partagées par notre réseau
            </p>
          </div>
        </div>
      </section>

      {/* Recherche et filtres */}
      <section className="py-4 bg-[#ffe8e4] border-b">
        <div className="max-w-[85%] mx-auto px-2 sm:px-4">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">Filtres:</span>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="bg-white rounded-lg p-1 flex flex-col sm:flex-row gap-2">
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

            <div className="flex flex-col">
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

            <div className="flex flex-col">
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

            <div className="flex flex-col">
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
        <div className="max-w-[85%] mx-auto px-2 sm:px-4">
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
          <h2 className="font-serif text-3xl font-bold mb-4">Vous recrutez ?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Publiez vos offres d&apos;emploi et trouvez les meilleurs talents du réseau France Alumni Guinée.
          </p>
          <Button size="lg" className="bg-[#ea292c] hover:bg-[#f48988]/90 font-semibold">
            Publier une offre
          </Button>
        </div>
      </section>
    </div>
  )
}
