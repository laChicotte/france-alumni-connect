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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, MoreHorizontal, Plus, Pencil, Trash2, Archive, Power, Users, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Evenement, TypeEvenement } from "@/types/database.types"

interface EvenementWithType extends Evenement {
  types_evenements?: { libelle: string } | null
  _count?: { inscriptions_evenements: number }
}

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState<EvenementWithType[]>([])
  const [types, setTypes] = useState<TypeEvenement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterArchive, setFilterArchive] = useState<string>("all")
  const [selectedEvent, setSelectedEvent] = useState<EvenementWithType | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    titre: "", slug: "", date: "", heure: "", lieu: "", type_evenement_id: "",
    description: "", image_url: "", places_max: "", lien_visio: "", actif: true, archive: false
  })

  useEffect(() => {
    fetchEvenements()
    fetchTypes()
    const user = localStorage.getItem('user')
    if (user) setCurrentUser(JSON.parse(user))
  }, [])

  const fetchEvenements = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('evenements')
      .select('*, types_evenements(libelle)')
      .order('date', { ascending: false })
    if (!error) setEvenements(data || [])
    setIsLoading(false)
  }

  const fetchTypes = async () => {
    const { data } = await supabase.from('types_evenements').select('*').order('ordre')
    setTypes(data || [])
  }

  const generateSlug = (titre: string) => {
    return titre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleCreate = async () => {
    setIsSubmitting(true)
    const { error } = await supabase.from('evenements').insert({
      ...formData,
      slug: formData.slug || generateSlug(formData.titre),
      places_max: formData.places_max ? parseInt(formData.places_max) : null,
      organisateur_id: currentUser?.id
    })
    if (!error) { fetchEvenements(); setDialogAction(null); resetForm() }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!selectedEvent) return
    setIsSubmitting(true)
    const { error } = await supabase.from('evenements').update({
      ...formData,
      slug: formData.slug || generateSlug(formData.titre),
      places_max: formData.places_max ? parseInt(formData.places_max) : null
    }).eq('id', selectedEvent.id)
    if (!error) { fetchEvenements(); setDialogAction(null); resetForm() }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedEvent) return
    setIsSubmitting(true)
    const { error } = await supabase.from('evenements').delete().eq('id', selectedEvent.id)
    if (!error) { fetchEvenements(); setDialogAction(null); setSelectedEvent(null) }
    setIsSubmitting(false)
  }

  const handleArchive = async (event: EvenementWithType) => {
    await supabase.from('evenements').update({ archive: !event.archive }).eq('id', event.id)
    fetchEvenements()
  }

  const handleToggleActif = async (event: EvenementWithType) => {
    await supabase.from('evenements').update({ actif: !event.actif }).eq('id', event.id)
    fetchEvenements()
  }

  const resetForm = () => {
    setFormData({
      titre: "", slug: "", date: "", heure: "", lieu: "", type_evenement_id: "",
      description: "", image_url: "", places_max: "", lien_visio: "", actif: true, archive: false
    })
    setSelectedEvent(null)
  }

  const openEditDialog = (event: EvenementWithType) => {
    setSelectedEvent(event)
    setFormData({
      titre: event.titre, slug: event.slug, date: event.date, heure: event.heure,
      lieu: event.lieu, type_evenement_id: event.type_evenement_id || "",
      description: event.description, image_url: event.image_url,
      places_max: event.places_max?.toString() || "", lien_visio: event.lien_visio || "",
      actif: event.actif, archive: event.archive
    })
    setDialogAction('edit')
  }

  const filteredEvents = evenements.filter(e => {
    const matchesSearch = e.titre.toLowerCase().includes(searchTerm.toLowerCase()) || e.lieu.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || e.type_evenement_id === filterType
    const matchesArchive = filterArchive === 'all' || (filterArchive === 'archive' ? e.archive : !e.archive)
    return matchesSearch && matchesType && matchesArchive
  })

  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
            <p className="text-gray-500">Gérez les événements de la communauté</p>
          </div>
        <Button onClick={() => { resetForm(); setDialogAction('create') }}>
          <Plus className="h-4 w-4 mr-2" /> Nouvel événement
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {types.map(t => <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterArchive} onValueChange={setFilterArchive}>
              <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="actif">Actifs</SelectItem>
                <SelectItem value="archive">Archivés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Liste des événements ({filteredEvents.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Événement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Aucun événement trouvé</TableCell></TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className={event.archive ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{event.titre}</TableCell>
                      <TableCell>{event.types_evenements?.libelle || '-'}</TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString('fr-FR')} à {event.heure}</TableCell>
                      <TableCell>{event.lieu}</TableCell>
                      <TableCell>
                        {event.archive ? (
                          <Badge variant="outline">Archivé</Badge>
                        ) : event.actif ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Actif</Badge>
                        ) : (
                          <Badge variant="outline">Inactif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(event)}><Pencil className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActif(event)}>
                              <Power className="mr-2 h-4 w-4" /> {event.actif ? 'Désactiver' : 'Activer'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleArchive(event)}>
                              <Archive className="mr-2 h-4 w-4" /> {event.archive ? 'Désarchiver' : 'Archiver'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedEvent(event); setDialogAction('delete') }}>
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
            <DialogTitle>{dialogAction === 'create' ? 'Nouvel événement' : 'Modifier l\'événement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value, slug: generateSlug(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Heure *</Label>
                <Input type="time" value={formData.heure} onChange={(e) => setFormData({ ...formData, heure: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lieu *</Label>
                <Input value={formData.lieu} onChange={(e) => setFormData({ ...formData, lieu: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type_evenement_id} onValueChange={(v) => setFormData({ ...formData, type_evenement_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {types.map(t => <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de places max</Label>
                <Input type="number" value={formData.places_max} onChange={(e) => setFormData({ ...formData, places_max: e.target.value })} placeholder="Illimité si vide" />
              </div>
              <div className="space-y-2">
                <Label>Lien visioconférence</Label>
                <Input value={formData.lien_visio} onChange={(e) => setFormData({ ...formData, lien_visio: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL *</Label>
              <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={formData.actif} onCheckedChange={(v) => setFormData({ ...formData, actif: v })} />
                <Label>Événement actif</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); resetForm() }}>Annuler</Button>
            <Button onClick={dialogAction === 'create' ? handleCreate : handleUpdate} disabled={isSubmitting || !formData.titre || !formData.date || !formData.heure || !formData.lieu || !formData.description || !formData.image_url}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (dialogAction === 'create' ? 'Créer' : 'Enregistrer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={dialogAction === 'delete'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'événement</DialogTitle>
            <DialogDescription>Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible.</DialogDescription>
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
