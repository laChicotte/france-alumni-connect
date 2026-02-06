"use client"

import { useEffect, useState } from "react"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, MoreHorizontal, Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Article, CategorieArticle } from "@/types/database.types"

interface ArticleWithCategorie extends Article {
  categories_articles?: { libelle: string } | null
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleWithCategorie[]>([])
  const [categories, setCategories] = useState<CategorieArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategorie, setFilterCategorie] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithCategorie | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    titre: "",
    slug: "",
    extrait: "",
    contenu: "",
    image_url: "",
    tags: "",
    categorie_id: "",
    status: "brouillon" as "brouillon" | "publie"
  })

  useEffect(() => {
    fetchArticles()
    fetchCategories()
    const user = localStorage.getItem('user')
    if (user) setCurrentUser(JSON.parse(user))
  }, [])

  const fetchArticles = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('*, categories_articles(libelle)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur:', error)
    } else {
      setArticles(data || [])
    }
    setIsLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories_articles')
      .select('*')
      .order('ordre')
    setCategories(data || [])
  }

  const generateSlug = (titre: string) => {
    return titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCreate = async () => {
    setIsSubmitting(true)
    const { error } = await supabase.from('articles').insert({
      ...formData,
      slug: formData.slug || generateSlug(formData.titre),
      auteur_id: currentUser?.id,
      date_publication: formData.status === 'publie' ? new Date().toISOString() : null
    })

    if (!error) {
      fetchArticles()
      setDialogAction(null)
      resetForm()
    }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!selectedArticle) return
    setIsSubmitting(true)
    const { error } = await supabase
      .from('articles')
      .update({
        ...formData,
        slug: formData.slug || generateSlug(formData.titre),
        date_publication: formData.status === 'publie' && selectedArticle.status !== 'publie'
          ? new Date().toISOString()
          : selectedArticle.date_publication
      })
      .eq('id', selectedArticle.id)

    if (!error) {
      fetchArticles()
      setDialogAction(null)
      resetForm()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedArticle) return
    setIsSubmitting(true)
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', selectedArticle.id)

    if (!error) {
      fetchArticles()
      setDialogAction(null)
      setSelectedArticle(null)
    }
    setIsSubmitting(false)
  }

  const handleStatusToggle = async (article: ArticleWithCategorie) => {
    const newStatus = article.status === 'publie' ? 'brouillon' : 'publie'
    const { error } = await supabase
      .from('articles')
      .update({
        status: newStatus,
        date_publication: newStatus === 'publie' ? new Date().toISOString() : article.date_publication
      })
      .eq('id', article.id)

    if (!error) fetchArticles()
  }

  const resetForm = () => {
    setFormData({
      titre: "",
      slug: "",
      extrait: "",
      contenu: "",
      image_url: "",
      tags: "",
      categorie_id: "",
      status: "brouillon"
    })
    setSelectedArticle(null)
  }

  const openEditDialog = (article: ArticleWithCategorie) => {
    setSelectedArticle(article)
    setFormData({
      titre: article.titre,
      slug: article.slug,
      extrait: article.extrait || "",
      contenu: article.contenu,
      image_url: article.image_url || "",
      tags: article.tags || "",
      categorie_id: article.categorie_id || "",
      status: article.status
    })
    setDialogAction('edit')
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.extrait?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesCategorie = filterCategorie === 'all' || article.categorie_id === filterCategorie
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus

    return matchesSearch && matchesCategorie && matchesStatus
  })

  return (
    <AdminWrapper>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-500">Gérez les publications et actualités</p>
          </div>
        <Button onClick={() => { resetForm(); setDialogAction('create') }}>
          <Plus className="h-4 w-4 mr-2" /> Nouvel article
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategorie} onValueChange={setFilterCategorie}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.libelle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="publie">Publié</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
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
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {article.titre}
                      </TableCell>
                      <TableCell>
                        {article.categories_articles?.libelle || '-'}
                      </TableCell>
                      <TableCell>
                        {article.status === 'publie' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publié</Badge>
                        ) : (
                          <Badge variant="outline">Brouillon</Badge>
                        )}
                      </TableCell>
                      <TableCell>{article.vues}</TableCell>
                      <TableCell>
                        {article.date_publication
                          ? new Date(article.date_publication).toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(article)}>
                              <Pencil className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusToggle(article)}>
                              {article.status === 'publie' ? (
                                <><EyeOff className="mr-2 h-4 w-4" /> Dépublier</>
                              ) : (
                                <><Eye className="mr-2 h-4 w-4" /> Publier</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => { setSelectedArticle(article); setDialogAction('delete') }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
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

      {/* Dialog Create/Edit */}
      <Dialog open={dialogAction === 'create' || dialogAction === 'edit'} onOpenChange={() => { setDialogAction(null); resetForm() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogAction === 'create' ? 'Nouvel article' : 'Modifier l\'article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Titre de l'article"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="slug-de-larticle"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={formData.categorie_id} onValueChange={(v) => setFormData({ ...formData, categorie_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.libelle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status} onValueChange={(v: "brouillon" | "publie") => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (séparés par des virgules)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="space-y-2">
              <Label>Extrait</Label>
              <Textarea
                value={formData.extrait}
                onChange={(e) => setFormData({ ...formData, extrait: e.target.value })}
                placeholder="Résumé court de l'article..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Contenu *</Label>
              <Textarea
                value={formData.contenu}
                onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                placeholder="Contenu de l'article..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); resetForm() }}>
              Annuler
            </Button>
            <Button
              onClick={dialogAction === 'create' ? handleCreate : handleUpdate}
              disabled={isSubmitting || !formData.titre || !formData.contenu}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (dialogAction === 'create' ? 'Créer' : 'Enregistrer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={dialogAction === 'delete'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'article</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer "{selectedArticle?.titre}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminWrapper>
  )
}
