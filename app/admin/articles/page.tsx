"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Article } from "@/types/database.types"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false })
    if (!error) setArticles(data || [])
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    setIsSubmitting(true)
    const { error } = await (supabase.from("articles") as any).delete().eq("id", id)
    if (!error) fetchArticles()
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

  const filteredArticles = articles.filter((article) =>
    article.titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                    <TableHead>Vues</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Aucun article trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-lg truncate">{article.titre}</TableCell>
                        <TableCell>
                          {article.status === "publie" ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publié</Badge>
                          ) : (
                            <Badge variant="outline">Brouillon</Badge>
                          )}
                        </TableCell>
                        <TableCell>{article.vues}</TableCell>
                        <TableCell>
                          {article.date_publication ? new Date(article.date_publication).toLocaleDateString("fr-FR") : "-"}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link href={`/admin/articles/${article.id}/modifier`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(article)}>
                            {article.status === "publie" ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Suspendre
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Publier
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => handleDelete(article.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
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
    </AdminWrapper>
  )
}
