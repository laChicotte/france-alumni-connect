"use client"

import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Tags, FolderCog, CalendarCog } from "lucide-react"
import Link from "next/link"

const configItems = [
  {
    title: "Secteurs d'activité",
    description: "Gérez les secteurs utilisés pour les profils alumni et les offres d'emploi",
    icon: Building,
    href: "/admin/config/secteurs",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    title: "Statuts professionnels",
    description: "Gérez les statuts professionnels des alumni (Salarié, Entrepreneur, etc.)",
    icon: Tags,
    href: "/admin/config/statuts-professionnels",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    title: "Catégories d'articles",
    description: "Gérez les catégories pour organiser les articles et actualités",
    icon: FolderCog,
    href: "/admin/config/categories-articles",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    title: "Types d'événements",
    description: "Gérez les types d'événements (Conférence, Webinar, Networking, etc.)",
    icon: CalendarCog,
    href: "/admin/config/types-evenements",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  }
]

export default function ConfigPage() {
  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
          <p className="text-gray-500">Gérez les données de référence de la plateforme</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className={`p-3 rounded-lg ${item.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-1">{item.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
        </div>
      </div>
    </AdminWrapper>
  )
}
