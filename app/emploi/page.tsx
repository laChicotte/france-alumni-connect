"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, Clock, Calendar } from "lucide-react"

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

      {/* Job Listings */}
      <section className="py-4 bg-[#ffe8e4]">
        <div className="max-w-[85%] mx-auto px-2 sm:px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobOffers.map((job) => (
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
      <section className="py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Vous recrutez ?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Publiez vos offres d&apos;emploi et trouvez les meilleurs talents du réseau France Alumni Guinée.
          </p>
          <Button size="lg" className="bg-[#FCD116] text-[#3558A2] hover:bg-[#FCD116]/90 font-semibold">
            Publier une offre
          </Button>
        </div>
      </section>
    </div>
  )
}
