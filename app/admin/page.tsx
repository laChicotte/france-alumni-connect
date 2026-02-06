"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  GraduationCap,
  FileText,
  Briefcase,
  Calendar,
  Handshake,
  AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { AdminWrapper } from "@/components/admin/admin-wrapper"

interface DashboardStats {
  totalUsers: number
  totalAlumni: number
  totalArticles: number
  totalJobs: number
  totalEvents: number
  totalPartners: number
  pendingUsers: number
  activeJobs: number
  upcomingEvents: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAlumni: 0,
    totalArticles: 0,
    totalJobs: 0,
    totalEvents: 0,
    totalPartners: 0,
    pendingUsers: 0,
    activeJobs: 0,
    upcomingEvents: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: alumniCount },
        { count: articlesCount },
        { count: jobsCount },
        { count: eventsCount },
        { count: partnersCount },
        { count: pendingCount },
        { count: activeJobsCount },
        { count: upcomingEventsCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('alumni_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('emplois').select('*', { count: 'exact', head: true }),
        supabase.from('evenements').select('*', { count: 'exact', head: true }),
        supabase.from('partenaires').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'en_attente'),
        supabase.from('emplois').select('*', { count: 'exact', head: true }).eq('actif', true),
        supabase.from('evenements').select('*', { count: 'exact', head: true }).eq('actif', true).eq('archive', false)
      ])

      setStats({
        totalUsers: usersCount || 0,
        totalAlumni: alumniCount || 0,
        totalArticles: articlesCount || 0,
        totalJobs: jobsCount || 0,
        totalEvents: eventsCount || 0,
        totalPartners: partnersCount || 0,
        pendingUsers: pendingCount || 0,
        activeJobs: activeJobsCount || 0,
        upcomingEvents: upcomingEventsCount || 0
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      subtitle: `${stats.pendingUsers} en attente`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/utilisateurs"
    },
    {
      title: "Profils Alumni",
      value: stats.totalAlumni,
      subtitle: "Dans l'annuaire",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/alumni"
    },
    {
      title: "Articles",
      value: stats.totalArticles,
      subtitle: "Publications",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/articles"
    },
    {
      title: "Offres d'emploi",
      value: stats.totalJobs,
      subtitle: `${stats.activeJobs} actives`,
      icon: Briefcase,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/admin/emplois"
    },
    {
      title: "Événements",
      value: stats.totalEvents,
      subtitle: `${stats.upcomingEvents} à venir`,
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-100",
      href: "/admin/evenements"
    },
    {
      title: "Partenaires",
      value: stats.totalPartners,
      subtitle: "Organisations",
      icon: Handshake,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      href: "/admin/partenaires"
    }
  ]

  return (
    <AdminWrapper>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500">Bienvenue dans l'espace d'administration</p>
        </div>

        {/* Alertes */}
        {stats.pendingUsers > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                {stats.pendingUsers} utilisateur(s) en attente de validation
              </p>
            </div>
            <Link href="/admin/utilisateurs">
              <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-600 hover:bg-yellow-100">
                Voir
              </Button>
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Link key={index} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <IconComponent className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "-" : stat.value}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/articles">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Nouvel article</span>
                </Button>
              </Link>
              <Link href="/admin/emplois">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-sm">Nouvelle offre</span>
                </Button>
              </Link>
              <Link href="/admin/evenements">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Nouvel événement</span>
                </Button>
              </Link>
              <Link href="/admin/utilisateurs">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Gérer les users</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminWrapper>
  )
}
