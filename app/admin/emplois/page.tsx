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
import { Search, MoreHorizontal, Plus, Pencil, Trash2, Power, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Emploi, Secteur } from "@/types/database.types"

interface EmploiWithSecteur extends Emploi {
  secteurs?: { libelle: string } | null
}

const jobTypes = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'stage', label: 'Stage' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'alternance', label: 'Alternance' },
]

export default function EmploisPage() {
  const [emplois, setEmplois] = useState<EmploiWithSecteur[]>([])
  const [secteurs, setSecteurs] = useState<Secteur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterActif, setFilterActif] = useState<string>("all")
  const [selectedEmploi, setSelectedEmploi] = useState<EmploiWithSecteur | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    titre: "", entreprise: "", localisation: "", type_contrat: "cdi" as any,
    secteur_id: "", description: "", profil_recherche: "", teletravail: false,
    email_contact: "", lien_postuler: "", date_expiration: "", actif: true
  })

  useEffect(() => {
    fetchEmplois()
    fetchSecteurs()
  }, [])

  const fetchEmplois = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('emplois')
      .select('*, secteurs(libelle)')
      .order('created_at', { ascending: false })
    if (!error) setEmplois(data || [])
    setIsLoading(false)
  }

  const fetchSecteurs = async () => {
    const { data } = await supabase.from('secteurs').select('*').order('ordre')
    setSecteurs(data || [])
  }

  const handleCreate = async () => {
    setIsSubmitting(true)
    const { error } = await supabase.from('emplois').insert(formData)
    if (!error) { fetchEmplois(); setDialogAction(null); resetForm() }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!selectedEmploi) return
    setIsSubmitting(true)
    const { error } = await supabase.from('emplois').update(formData).eq('id', selectedEmploi.id)
    if (!error) { fetchEmplois(); setDialogAction(null); resetForm() }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedEmploi) return
    setIsSubmitting(true)
    const { error } = await supabase.from('emplois').delete().eq('id', selectedEmploi.id)
    if (!error) { fetchEmplois(); setDialogAction(null); setSelectedEmploi(null) }
    setIsSubmitting(false)
  }

  const handleToggleActif = async (emploi: EmploiWithSecteur) => {
    await supabase.from('emplois').update({ actif: !emploi.actif }).eq('id', emploi.id)
    fetchEmplois()
  }

  const resetForm = () => {
    setFormData({
      titre: "", entreprise: "", localisation: "", type_contrat: "cdi",
      secteur_id: "", description: "", profil_recherche: "", teletravail: false,
      email_contact: "", lien_postuler: "", date_expiration: "", actif: true
    })
    setSelectedEmploi(null)
  }

  const openEditDialog = (emploi: EmploiWithSecteur) => {
    setSelectedEmploi(emploi)
    setFormData({
      titre: emploi.titre, entreprise: emploi.entreprise, localisation: emploi.localisation,
      type_contrat: emploi.type_contrat, secteur_id: emploi.secteur_id || "",
      description: emploi.description, profil_recherche: emploi.profil_recherche || "",
      teletravail: emploi.teletravail, email_contact: emploi.email_contact,
      lien_postuler: emploi.lien_postuler || "", date_expiration: emploi.date_expiration || "", actif: emploi.actif
    })
    setDialogAction('edit')
  }

  const filteredEmplois = emplois.filter(e => {
    const matchesSearch = e.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.entreprise.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || e.type_contrat === filterType
    const matchesActif = filterActif === 'all' || (filterActif === 'actif' ? e.actif : !e.actif)
    return matchesSearch && matchesType && matchesActif
  })

  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offres d'emploi</h1>
            <p className="text-gray-500">Gérez les offres d'emploi de la plateforme</p>
          </div>
        <Button onClick={() => { resetForm(); setDialogAction('create') }}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle offre
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
              <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {jobTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterActif} onValueChange={setFilterActif}>
              <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Liste des offres ({filteredEmplois.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poste</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmplois.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Aucune offre trouvée</TableCell></TableRow>
                ) : (
                  filteredEmplois.map((emploi) => (
                    <TableRow key={emploi.id}>
                      <TableCell className="font-medium">{emploi.titre}</TableCell>
                      <TableCell>{emploi.entreprise}</TableCell>
                      <TableCell><Badge variant="outline">{jobTypes.find(t => t.value === emploi.type_contrat)?.label}</Badge></TableCell>
                      <TableCell>{emploi.localisation}</TableCell>
                      <TableCell>
                        {emploi.actif ? (
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
                            <DropdownMenuItem onClick={() => openEditDialog(emploi)}><Pencil className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActif(emploi)}>
                              <Power className="mr-2 h-4 w-4" /> {emploi.actif ? 'Désactiver' : 'Activer'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedEmploi(emploi); setDialogAction('delete') }}>
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
            <DialogTitle>{dialogAction === 'create' ? 'Nouvelle offre' : 'Modifier l\'offre'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre du poste *</Label>
                <Input value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Entreprise *</Label>
                <Input value={formData.entreprise} onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localisation *</Label>
                <Input value={formData.localisation} onChange={(e) => setFormData({ ...formData, localisation: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type de contrat</Label>
                <Select value={formData.type_contrat} onValueChange={(v: any) => setFormData({ ...formData, type_contrat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {jobTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Secteur</Label>
                <Select value={formData.secteur_id} onValueChange={(v) => setFormData({ ...formData, secteur_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {secteurs.map(s => <SelectItem key={s.id} value={s.id}>{s.libelle}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date d'expiration</Label>
                <Input type="date" value={formData.date_expiration} onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email de contact *</Label>
              <Input type="email" value={formData.email_contact} onChange={(e) => setFormData({ ...formData, email_contact: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Lien pour postuler</Label>
              <Input value={formData.lien_postuler} onChange={(e) => setFormData({ ...formData, lien_postuler: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Profil recherché</Label>
              <Textarea value={formData.profil_recherche} onChange={(e) => setFormData({ ...formData, profil_recherche: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={formData.teletravail} onCheckedChange={(v) => setFormData({ ...formData, teletravail: v })} />
                <Label>Télétravail possible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.actif} onCheckedChange={(v) => setFormData({ ...formData, actif: v })} />
                <Label>Offre active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); resetForm() }}>Annuler</Button>
            <Button onClick={dialogAction === 'create' ? handleCreate : handleUpdate} disabled={isSubmitting || !formData.titre || !formData.entreprise || !formData.description || !formData.email_contact}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (dialogAction === 'create' ? 'Créer' : 'Enregistrer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={dialogAction === 'delete'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'offre</DialogTitle>
            <DialogDescription>Voulez-vous vraiment supprimer cette offre ? Cette action est irréversible.</DialogDescription>
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
