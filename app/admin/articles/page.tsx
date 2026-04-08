"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Download, Pin, PinOff, MoreVertical, CalendarClock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Article } from "@/types/database.types"
import { downloadCsv } from "@/lib/export/csv"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [antidateArticle, setAntidateArticle] = useState<Article | null>(null)
  const [antidateValue, setAntidateValue] = useState("")

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("epingle", { ascending: false })
      .order("created_at", { ascending: false })
    if (!error) setArticles(data || [])
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    setIsSubmitting(true)
    const { error } = await (supabase.from("articles") as any).delete().eq("id", id)
    if (!error) fetchArticles()
    setIsSubmitting(false)
  }

  const handleTogglePin = async (article: Article) => {
    if (!article.epingle) {
      const pinnedCount = articles.filter((a) => a.epingle).length
      if (pinnedCount >= 3) {
        alert("Vous ne pouvez pas épingler plus de 3 articles. Désépinglez un article d'abord.")
        return
      }
    }
    const { error } = await (supabase.from("articles") as any)
      .update({ epingle: !article.epingle })
      .eq("id", article.id)
    if (!error) fetchArticles()
  }

  const openAntidateDialog = (article: Article) => {
    const current = article.date_publication
      ? new Date(article.date_publication).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
    setAntidateValue(current)
    setAntidateArticle(article)
  }

  const handleAntidate = async () => {
    if (!antidateArticle || !antidateValue) return
    setIsSubmitting(true)
    const { error } = await (supabase.from("articles") as any)
      .update({ date_publication: new Date(antidateValue).toISOString() })
      .eq("id", antidateArticle.id)
    if (!error) {
      fetchArticles()
      setAntidateArticle(null)
    }
    setIsSubmitting(false)
  }

  const handleToggleStatus = async (article: Article) => {
    const newStatus = article.status === "publie" ? "brouillon" : "publie"
    const { error } = await (supabase.from("articles") as any)
      .update({
        status: newStatus,
        date_publication: newStatus === "publie" ? new Date().toISOString() : article.date_publication,
      })
      .eq("id", article.id)
    if (!error) fetchArticles()
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.titre.toLowerCase().includes(searchTerm.toLowerCase())
    const articleDate = new Date(article.created_at)
    const matchesStartDate = !startDate || articleDate >= new Date(`${startDate}T00:00:00`)
    const matchesEndDate = !endDate || articleDate <= new Date(`${endDate}T23:59:59`)
    return matchesSearch && matchesStartDate && matchesEndDate
  })

  const handleExportCsv = () => {
    const rows = filteredArticles.map((article) => ({
      titre: article.titre,
      date_creation: new Date(article.created_at).toLocaleDateString("fr-FR"),
      vues: article.vues,
    }))
    downloadCsv(`articles_${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  return (
    <AdminWrapper>
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-500">Liste des articles, édition en page dédiée</p>
          </div>
          <Link href="/admin/articles/nouveau">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel article
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-[170px]" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-[170px]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des articles ({filteredArticles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Épinglé</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Aucun article trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArticles.map((article) => (
                      <TableRow key={article.id} className={article.epingle ? "bg-amber-50" : ""}>
                        <TableCell className="font-medium max-w-lg truncate">
                          <div className="flex items-center gap-2">
                            {article.epingle && <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                            <span>{article.titre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.status === "publie" ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publié</Badge>
                          ) : (
                            <Badge variant="outline">Brouillon</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {article.epingle ? (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Épinglé</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>{article.vues}</TableCell>
                        <TableCell>
                          {article.date_publication ? new Date(article.date_publication).toLocaleDateString("fr-FR") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/articles/${article.id}/modifier`} className="flex items-center gap-2 cursor-pointer">
                                  <Pencil className="h-4 w-4" />
                                  Modifier
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleToggleStatus(article)}
                              >
                                {article.status === "publie" ? (
                                  <><EyeOff className="h-4 w-4" />Suspendre</>
                                ) : (
                                  <><Eye className="h-4 w-4" />Publier</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 cursor-pointer ${article.epingle ? "text-amber-600 focus:text-amber-600" : ""}`}
                                onClick={() => handleTogglePin(article)}
                              >
                                {article.epingle ? (
                                  <><PinOff className="h-4 w-4" />Désépingler</>
                                ) : (
                                  <><Pin className="h-4 w-4" />Épingler</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => openAntidateDialog(article)}
                              >
                                <CalendarClock className="h-4 w-4" />
                                Antidater
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                disabled={isSubmitting}
                                onClick={() => handleDelete(article.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!antidateArticle} onOpenChange={(open) => !open && setAntidateArticle(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Antidater la publication</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground truncate">
              {antidateArticle?.titre}
            </p>
            <Input
              type="datetime-local"
              value={antidateValue}
              onChange={(e) => setAntidateValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAntidateArticle(null)}>Annuler</Button>
            <Button
              className="bg-[#3558A2] hover:bg-[#3558A2]/90"
              disabled={isSubmitting || !antidateValue}
              onClick={handleAntidate}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminWrapper>
  )
}
