"use client"

import { useEffect, useState } from "react"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Search, MoreHorizontal, Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Partenaire } from "@/types/database.types"
import Image from "next/image"

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActif, setFilterActif] = useState<string>("all")
  const [selectedPartenaire, setSelectedPartenaire] = useState<Partenaire | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    nom: "", logo_url: "", site_web: "", description: "", ordre: 0, actif: true
  })

  useEffect(() => {
    fetchPartenaires()
  }, [])

  const fetchPartenaires = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('partenaires')
      .select('*')
      .order('ordre', { ascending: true })
    if (!error) setPartenaires(data || [])
    setIsLoading(false)
  }

  const handleCreate = async () => {
    setIsSubmitting(true)
    const { error } = await supabase.from('partenaires').insert(formData)
    if (!error) { fetchPartenaires(); setDialogAction(null); resetForm() }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!selectedPartenaire) return
    setIsSubmitting(true)
    const { error } = await supabase.from('partenaires').update(formData).eq('id', selectedPartenaire.id)
    if (!error) { fetchPartenaires(); setDialogAction(null); resetForm() }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedPartenaire) return
    setIsSubmitting(true)
    const { error } = await supabase.from('partenaires').delete().eq('id', selectedPartenaire.id)
    if (!error) { fetchPartenaires(); setDialogAction(null); setSelectedPartenaire(null) }
    setIsSubmitting(false)
  }

  const handleToggleActif = async (partenaire: Partenaire) => {
    await supabase.from('partenaires').update({ actif: !partenaire.actif }).eq('id', partenaire.id)
    fetchPartenaires()
  }

  const resetForm = () => {
    setFormData({ nom: "", logo_url: "", site_web: "", description: "", ordre: 0, actif: true })
    setSelectedPartenaire(null)
  }

  const openEditDialog = (partenaire: Partenaire) => {
    setSelectedPartenaire(partenaire)
    setFormData({
      nom: partenaire.nom, logo_url: partenaire.logo_url, site_web: partenaire.site_web || "",
      description: partenaire.description || "", ordre: partenaire.ordre, actif: partenaire.actif
    })
    setDialogAction('edit')
  }

  const filteredPartenaires = partenaires.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActif = filterActif === 'all' || (filterActif === 'actif' ? p.actif : !p.actif)
    return matchesSearch && matchesActif
  })

  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partenaires</h1>
            <p className="text-gray-500">Gérez les partenaires de la plateforme</p>
          </div>
        <Button onClick={() => { resetForm(); setDialogAction('create') }}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau partenaire
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <select
              value={filterActif}
              onChange={(e) => setFilterActif(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">Tous</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Masqués</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Liste des partenaires ({filteredPartenaires.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Site web</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartenaires.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Aucun partenaire trouvé</TableCell></TableRow>
                ) : (
                  filteredPartenaires.map((partenaire) => (
                    <TableRow key={partenaire.id} className={!partenaire.actif ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="w-16 h-10 relative bg-gray-100 rounded overflow-hidden">
                          {partenaire.logo_url && (
                            <Image src={partenaire.logo_url} alt={partenaire.nom} fill className="object-contain" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{partenaire.nom}</TableCell>
                      <TableCell>
                        {partenaire.site_web ? (
                          <a href={partenaire.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            {partenaire.site_web}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{partenaire.ordre}</TableCell>
                      <TableCell>
                        {partenaire.actif ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <Eye className="h-3 w-3 mr-1" /> Visible
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="h-3 w-3 mr-1" /> Masqué
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(partenaire)}><Pencil className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActif(partenaire)}>
                              {partenaire.actif ? <><EyeOff className="mr-2 h-4 w-4" /> Masquer</> : <><Eye className="mr-2 h-4 w-4" /> Afficher</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedPartenaire(partenaire); setDialogAction('delete') }}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction === 'create' ? 'Nouveau partenaire' : 'Modifier le partenaire'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL *</Label>
              <Input value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Site web</Label>
              <Input value={formData.site_web} onChange={(e) => setFormData({ ...formData, site_web: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={formData.ordre} onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={formData.actif} onCheckedChange={(v) => setFormData({ ...formData, actif: v })} />
                <Label>Visible</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); resetForm() }}>Annuler</Button>
            <Button onClick={dialogAction === 'create' ? handleCreate : handleUpdate} disabled={isSubmitting || !formData.nom || !formData.logo_url}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (dialogAction === 'create' ? 'Créer' : 'Enregistrer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={dialogAction === 'delete'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le partenaire</DialogTitle>
            <DialogDescription>Voulez-vous vraiment supprimer ce partenaire ? Cette action est irréversible.</DialogDescription>
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
