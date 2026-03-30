"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Search, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

type RegistrationRow = {
  id: string
  source: "Alumni" | "Externe"
  nom: string
  prenom: string
  email: string
  telephone: string
  organisation: string
  isFonctionnaire: boolean
  createdAt: string
}

type RegistrationRaw = {
  id: string
  user_id: string | null
  created_at: string
  nom_externe: string | null
  prenom_externe: string | null
  email_externe: string | null
  telephone_externe: string | null
  organisation_externe: string | null
}

type UserLite = {
  id: string
  nom: string | null
  prenom: string | null
  email: string
}

type AlumniProfileLite = {
  user_id: string
  statuts_professionnels?: { libelle: string } | null
}

type EventLite = {
  id: string
  titre: string
}

export default function EventRegistrationsPage() {
  const params = useParams<{ id: string }>()
  const eventId = params?.id

  const [eventTitle, setEventTitle] = useState("")
  const [rows, setRows] = useState<RegistrationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSource, setFilterSource] = useState("all")
  const [filterFonctionnaire, setFilterFonctionnaire] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 10

  useEffect(() => {
    const loadData = async () => {
      if (!eventId) return
      setIsLoading(true)

      const { data: eventData } = await (supabase.from("evenements") as any)
        .select("id, titre")
        .eq("id", eventId)
        .single()
      setEventTitle(((eventData as EventLite | null)?.titre) || "Événement")

      const { data: registrationsData } = await (supabase.from("inscriptions_evenements") as any)
        .select(`
          id,
          user_id,
          created_at,
          nom_externe,
          prenom_externe,
          email_externe,
          telephone_externe,
          organisation_externe
        `)
        .eq("evenement_id", eventId)
        .order("created_at", { ascending: false })

      const registrations = (registrationsData || []) as RegistrationRaw[]
      const internalUserIds = Array.from(
        new Set(registrations.map((r) => r.user_id).filter(Boolean) as string[]),
      )

      const usersById = new Map<string, UserLite>()
      const statusByUserId = new Map<string, string>()

      if (internalUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("id, nom, prenom, email")
          .in("id", internalUserIds)
        for (const user of (usersData || []) as UserLite[]) {
          usersById.set(user.id, user)
        }

        const { data: profilesData } = await (supabase.from("alumni_profiles") as any)
          .select("user_id, statuts_professionnels(libelle)")
          .in("user_id", internalUserIds)
        for (const profile of (profilesData || []) as AlumniProfileLite[]) {
          statusByUserId.set(profile.user_id, profile.statuts_professionnels?.libelle || "-")
        }
      }

      const nextRows: RegistrationRow[] = registrations.map((registration) => {
        if (registration.user_id) {
          const user = usersById.get(registration.user_id)
          const statutPro = statusByUserId.get(registration.user_id) || "-"
          return {
            id: registration.id,
            source: "Alumni",
            nom: user?.nom || "-",
            prenom: user?.prenom || "-",
            email: user?.email || "-",
            telephone: "-",
            organisation: "-",
            isFonctionnaire: statutPro.toLowerCase().includes("fonctionnaire"),
            createdAt: registration.created_at,
          }
        }

        return {
          id: registration.id,
          source: "Externe",
          nom: registration.nom_externe || "-",
          prenom: registration.prenom_externe || "-",
          email: registration.email_externe || "-",
          telephone: registration.telephone_externe || "-",
          organisation: registration.organisation_externe || "-",
          isFonctionnaire: false,
          createdAt: registration.created_at,
        }
      })

      setRows(nextRows)
      setIsLoading(false)
    }

    loadData()
  }, [eventId])

  const stats = useMemo(() => {
    const total = rows.length
    const alumniCount = rows.filter((r) => r.source === "Alumni").length
    const fonctionnaireCount = rows.filter((r) => r.isFonctionnaire).length
    return {
      total,
      alumniCount,
      fonctionnaireCount,
      alumniPct: total > 0 ? Math.round((alumniCount / total) * 100) : 0,
      fonctionnairePct: total > 0 ? Math.round((fonctionnaireCount / total) * 100) : 0,
    }
  }, [rows])

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()
    return rows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        row.nom.toLowerCase().includes(normalizedSearch) ||
        row.prenom.toLowerCase().includes(normalizedSearch) ||
        row.email.toLowerCase().includes(normalizedSearch) ||
        row.organisation.toLowerCase().includes(normalizedSearch)

      const matchesSource =
        filterSource === "all" ||
        (filterSource === "alumni" && row.source === "Alumni") ||
        (filterSource === "externe" && row.source === "Externe")

      const matchesFonctionnaire =
        filterFonctionnaire === "all" ||
        (filterFonctionnaire === "oui" && row.isFonctionnaire) ||
        (filterFonctionnaire === "non" && !row.isFonctionnaire)

      return matchesSearch && matchesSource && matchesFonctionnaire
    })
  }, [rows, searchTerm, filterSource, filterFonctionnaire])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterSource, filterFonctionnaire])

  return (
    <AdminWrapper>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inscrits événement</h1>
            <p className="text-gray-500">{eventTitle}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/evenements">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux événements
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-foreground">Inscrits Alumni</p>
                  <p className="text-xs text-muted-foreground">{stats.alumniCount} sur {stats.total}</p>
                </div>
                <p className="text-2xl font-bold text-[#3558A2]">{stats.alumniPct}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-foreground">Inscrits Fonctionnaires</p>
                  <p className="text-xs text-muted-foreground">{stats.fonctionnaireCount} sur {stats.total}</p>
                </div>
                <p className="text-2xl font-bold text-[#3558A2]">{stats.fonctionnairePct}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* <Card>
          <CardContent className="pt-0 pb-0"> */}
            <div className="flex flex-col gap-1.5 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher (nom, email, organisation...)"
                  className="h-9 pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="h-9 w-full sm:w-[160px]">
                  <SelectValue placeholder="Type inscrit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                  <SelectItem value="externe">Externe</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFonctionnaire} onValueChange={setFilterFonctionnaire}>
                <SelectTrigger className="h-9 w-full sm:w-[165px]">
                  <SelectValue placeholder="Fonctionnaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Fonctionnaire: Tous</SelectItem>
                  <SelectItem value="oui">Oui</SelectItem>
                  <SelectItem value="non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>
          {/* </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle>Liste des inscrits ({filteredRows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Date inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                          Aucun inscrit trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.prenom} {row.nom}</TableCell>
                          <TableCell>
                            <Badge variant={row.source === "Alumni" ? "default" : "outline"}>
                              {row.source}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.organisation}</TableCell>
                          <TableCell>{new Date(row.createdAt).toLocaleString("fr-FR")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-gray-500">
                    {filteredRows.length === 0
                      ? "0 résultat"
                      : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredRows.length)} sur ${filteredRows.length}`
                    }
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                      Précédent
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {safePage} / {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                      Suivant
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminWrapper>
  )
}
