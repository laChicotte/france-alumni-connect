"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { TypeEvenement } from "@/types/database.types"
import Link from "next/link"

const PAGE_SIZE = 6

export default function TypesEvenementsPage() {
  const [items, setItems] = useState<TypeEvenement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<TypeEvenement | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ libelle: "", ordre: 0 })
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, currentPage])

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const fetchItems = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from('types_evenements').select('*').order('ordre')
    if (error) {
      setFeedback({ type: "error", message: `Chargement impossible: ${error.message}` })
    } else {
      setItems(data || [])
    }
    setIsLoading(false)
  }

  const handleCreate = async () => {
    setIsSubmitting(true)
    setFeedback(null)
    const { error } = await supabase.from('types_evenements').insert(formData)
    if (error) {
      setFeedback({ type: "error", message: `Création échouée: ${error.message}` })
    } else {
      setFeedback({ type: "success", message: "Type d'événement créé avec succès." })
      fetchItems(); setDialogAction(null); resetForm()
    }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!selectedItem) return
    setIsSubmitting(true)
    setFeedback(null)
    const { error } = await supabase.from('types_evenements').update(formData).eq('id', selectedItem.id)
    if (error) {
      setFeedback({ type: "error", message: `Modification échouée (${selectedItem.libelle}): ${error.message}` })
    } else {
      setFeedback({ type: "success", message: `Type "${selectedItem.libelle}" mis à jour.` })
      fetchItems(); setDialogAction(null); resetForm()
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    setIsSubmitting(true)
    setFeedback(null)
    const { error } = await supabase.from('types_evenements').delete().eq('id', selectedItem.id)
    if (error) {
      setFeedback({ type: "error", message: `Suppression échouée (${selectedItem.libelle}): ${error.message}` })
    } else {
      setFeedback({ type: "success", message: `Type "${selectedItem.libelle}" supprimé.` })
      fetchItems(); setDialogAction(null); setSelectedItem(null)
    }
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setFormData({ libelle: "", ordre: 0 })
    setSelectedItem(null)
  }

  const openEditDialog = (item: TypeEvenement) => {
    setSelectedItem(item)
    setFormData({ libelle: item.libelle, ordre: item.ordre })
    setDialogAction('edit')
  }

  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/config" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la configuration
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Types d'événements</h1>
              <p className="text-gray-500">Gérez les types d'événements de la communauté</p>
            </div>
          <Button onClick={() => { resetForm(); setDialogAction('create') }}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Liste des types ({items.length})</CardTitle></CardHeader>
        <CardContent>
          {feedback && (
            <Alert variant={feedback.type === "error" ? "destructive" : "default"} className="mb-4">
              {feedback.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500">Aucun type</TableCell></TableRow>
                ) : (
                  paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.libelle}</TableCell>
                      <TableCell>{item.ordre}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setDialogAction('delete') }}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {!isLoading && items.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Create/Edit */}
      <Dialog open={dialogAction === 'create' || dialogAction === 'edit'} onOpenChange={() => { setDialogAction(null); resetForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction === 'create' ? 'Nouveau type' : 'Modifier le type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Libellé *</Label>
              <Input value={formData.libelle} onChange={(e) => setFormData({ ...formData, libelle: e.target.value })} placeholder="Ex: Conférence" />
            </div>
            <div className="space-y-2">
              <Label>Ordre d'affichage</Label>
              <Input type="number" value={formData.ordre} onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); resetForm() }}>Annuler</Button>
            <Button onClick={dialogAction === 'create' ? handleCreate : handleUpdate} disabled={isSubmitting || !formData.libelle}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (dialogAction === 'create' ? 'Créer' : 'Enregistrer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={dialogAction === 'delete'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le type</DialogTitle>
            <DialogDescription>Voulez-vous vraiment supprimer "{selectedItem?.libelle}" ?</DialogDescription>
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
