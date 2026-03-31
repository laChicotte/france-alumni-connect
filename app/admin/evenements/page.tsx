"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Pencil, Trash2, Archive, Loader2, CalendarDays, MapPin, Clock3, Eye, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Evenement, TypeEvenement } from "@/types/database.types"
import { downloadCsv } from "@/lib/export/csv"

interface EvenementWithType extends Evenement {
  types_evenements?: { libelle: string } | null
  inscriptions_count?: number
}

export default function EvenementsPage() {
  const PAGE_SIZE = 4
  const [evenements, setEvenements] = useState<EvenementWithType[]>([])
  const [types, setTypes] = useState<TypeEvenement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterArchive, setFilterArchive] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<EvenementWithType | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

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
    const { data, error } = await (supabase
      .from('evenements')
      .select('*, types_evenements(libelle)') as any)
      .order('date', { ascending: true })
    if (!error) {
      const events = (data || []) as EvenementWithType[]
      const withCounts = await Promise.all(
        events.map(async (event) => {
          const { count } = await (supabase
            .from("inscriptions_evenements") as any)
            .select("*", { count: "exact", head: true })
            .eq("evenement_id", event.id)
          return { ...event, inscriptions_count: count || 0 }
        })
      )
      setEvenements(withCounts)
    }
    setIsLoading(false)
  }

  const fetchTypes = async () => {
    const { data } = await supabase.from('types_evenements').select('*').order('ordre')
    setTypes(data || [])
  }

  const generateSlug = (titre: string) => {
    return titre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const uploadEventImage = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const path = `${currentUser?.id || "unknown"}/event_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from("evenements-media")
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      })

    if (error || !data) throw error || new Error("Upload image événement échoué")
    const { data: publicData } = supabase.storage.from("evenements-media").getPublicUrl(data.path)
    return publicData.publicUrl
  }

  const handleImageSelect = (file: File | null) => {
    setImageFile(file)
    if (!file) {
      setImagePreviewUrl(formData.image_url || null)
      return
    }
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  const handleCreate = async () => {
    setIsSubmitting(true)
    try {
      let imageUrl = formData.image_url || ""
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile)
      }
      if (!imageUrl) {
        imageUrl = "/placeholder.svg"
      }

      const { error } = await (supabase.from('evenements') as any).insert({
        ...formData,
        image_url: imageUrl,
        slug: formData.slug || generateSlug(formData.titre),
        places_max: formData.places_max ? parseInt(formData.places_max) : null,
        organisateur_id: currentUser?.id
      })
      if (!error) { fetchEvenements(); setDialogAction(null); resetForm() }
    } catch (error) {
      console.error("Erreur création événement:", error)
    }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!selectedEvent) return
    setIsSubmitting(true)
    try {
      let imageUrl = formData.image_url || selectedEvent.image_url || "/placeholder.svg"
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile)
      }

      const { error } = await (supabase.from('evenements') as any).update({
        ...formData,
        image_url: imageUrl,
        slug: formData.slug || generateSlug(formData.titre),
        places_max: formData.places_max ? parseInt(formData.places_max) : null
      }).eq('id', selectedEvent.id)
      if (!error) { fetchEvenements(); setDialogAction(null); resetForm() }
    } catch (error) {
      console.error("Erreur update événement:", error)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedEvent) return
    setIsSubmitting(true)
    const { error } = await (supabase.from('evenements') as any).delete().eq('id', selectedEvent.id)
    if (!error) { fetchEvenements(); setDialogAction(null); setSelectedEvent(null) }
    setIsSubmitting(false)
  }

  const handleMarkTerminated = async (event: EvenementWithType) => {
    await (supabase.from('evenements') as any).update({ archive: true, actif: false }).eq('id', event.id)
    fetchEvenements()
  }

  const resetForm = () => {
    setFormData({
      titre: "", slug: "", date: "", heure: "", lieu: "", type_evenement_id: "",
      description: "", image_url: "", places_max: "", lien_visio: "", actif: true, archive: false
    })
    setImageFile(null)
    setImagePreviewUrl(null)
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
    setImageFile(null)
    setImagePreviewUrl(event.image_url || null)
    setDialogAction('edit')
  }

  const filteredEvents = evenements.filter(e => {
    const matchesSearch = e.titre.toLowerCase().includes(searchTerm.toLowerCase()) || e.lieu.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || e.type_evenement_id === filterType
    const matchesArchive = filterArchive === 'all' || (filterArchive === 'termine' ? e.archive : !e.archive)
    const eventDate = new Date(e.date)
    const matchesStartDate = !startDate || eventDate >= new Date(`${startDate}T00:00:00`)
    const matchesEndDate = !endDate || eventDate <= new Date(`${endDate}T23:59:59`)
    return matchesSearch && matchesType && matchesArchive && matchesStartDate && matchesEndDate
  })

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedEvents = filteredEvents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterType, filterArchive, startDate, endDate])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const handleExportEventsCsv = async () => {
    const eventIds = filteredEvents.map((event) => event.id)
    const registrationsByEvent = new Map<string, { total: number; alumni: number; externes: number }>()

    if (eventIds.length > 0) {
      const { data: registrationsData } = await (supabase.from("inscriptions_evenements") as any)
        .select("evenement_id, user_id")
        .in("evenement_id", eventIds)
      for (const registration of (registrationsData || []) as Array<{ evenement_id: string; user_id: string | null }>) {
        const current = registrationsByEvent.get(registration.evenement_id) || { total: 0, alumni: 0, externes: 0 }
        current.total += 1
        if (registration.user_id) current.alumni += 1
        else current.externes += 1
        registrationsByEvent.set(registration.evenement_id, current)
      }
    }

    const rows = filteredEvents.map((event) => {
      const counts = registrationsByEvent.get(event.id) || { total: 0, alumni: 0, externes: 0 }
      return {
        titre: event.titre,
        date: event.date,
        heure: event.heure,
        lieu: event.lieu,
        mode: event.lien_visio ? "En ligne" : "Présentiel",
        type: event.types_evenements?.libelle || "",
        participants_total: counts.total,
        participants_alumni: counts.alumni,
        participants_externes: counts.externes,
        places_max: event.places_max || "",
        statut: event.archive ? "Terminé" : "Ouvert",
      }
    })
    downloadCsv(`evenements_${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  const handleExportParticipantsCsv = async () => {
    const eventIds = filteredEvents.map((event) => event.id)
    if (eventIds.length === 0) {
      downloadCsv(`participants_evenements_${new Date().toISOString().slice(0, 10)}.csv`, [])
      return
    }

    const eventTitleById = new Map(filteredEvents.map((event) => [event.id, event.titre]))
    const { data: registrationsData } = await (supabase.from("inscriptions_evenements") as any)
      .select("evenement_id, user_id, nom_externe, prenom_externe, email_externe, organisation_externe, created_at")
      .in("evenement_id", eventIds)
      .order("created_at", { ascending: false })

    const registrations = (registrationsData || []) as Array<{
      evenement_id: string
      user_id: string | null
      nom_externe: string | null
      prenom_externe: string | null
      email_externe: string | null
      organisation_externe: string | null
      created_at: string
    }>

    const alumniIds = Array.from(new Set(registrations.map((r) => r.user_id).filter(Boolean) as string[]))
    const userById = new Map<string, { nom: string | null; prenom: string | null; email: string }>()
    if (alumniIds.length > 0) {
      const { data: usersData } = await supabase.from("users").select("id, nom, prenom, email").in("id", alumniIds)
      for (const user of (usersData || []) as Array<{ id: string; nom: string | null; prenom: string | null; email: string }>) {
        userById.set(user.id, { nom: user.nom, prenom: user.prenom, email: user.email })
      }
    }

    const rows = registrations.map((registration) => {
      if (registration.user_id) {
        const user = userById.get(registration.user_id)
        return {
          evenement: eventTitleById.get(registration.evenement_id) || registration.evenement_id,
          type_participant: "Alumni",
          nom: user?.nom || "",
          prenom: user?.prenom || "",
          email: user?.email || "",
          organisation: "",
          date_inscription: registration.created_at,
        }
      }
      return {
        evenement: eventTitleById.get(registration.evenement_id) || registration.evenement_id,
        type_participant: "Externe",
        nom: registration.nom_externe || "",
        prenom: registration.prenom_externe || "",
        email: registration.email_externe || "",
        organisation: registration.organisation_externe || "",
        date_inscription: registration.created_at,
      }
    })

    downloadCsv(`participants_evenements_${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
            <p className="text-gray-500">Gérez les événements de la communauté</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleExportEventsCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV événements
            </Button>
            <Button variant="outline" onClick={handleExportParticipantsCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV participants
            </Button>
            <Button onClick={() => { resetForm(); setDialogAction('create') }}>
              <Plus className="h-4 w-4 mr-2" /> Nouvel événement
            </Button>
          </div>
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
                <SelectItem value="actif">Ouverts</SelectItem>
                <SelectItem value="termine">Terminés</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-[170px]"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-[170px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Événements ({filteredEvents.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucun événement trouvé</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {paginatedEvents.map((event) => (
                <Card key={event.id} className={event.archive ? "opacity-70 border-dashed" : ""}>
                  <img src={event.image_url || "/placeholder.svg"} alt={event.titre} className="h-40 w-full object-cover rounded-t-lg" />
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{event.types_evenements?.libelle || "Événement"}</Badge>
                      {event.archive ? (
                        <Badge variant="secondary">Terminé</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ouvert</Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg line-clamp-2">{event.titre}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#3558A2]" />
                          {new Date(event.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-[#3558A2]" />
                          {event.heure}
                        </span>
                        <span className="text-xs">
                          Inscriptions: {event.inscriptions_count || 0}
                          {event.places_max ? ` / ${event.places_max}` : " (illimité)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#3558A2]" />{event.lieu}</div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1 pb-1">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="icon" className="h-8 w-8 shrink-0" title="Voir inscrits">
                          <Link href={`/admin/evenements/${event.id}/inscrits`} aria-label="Voir inscrits">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          title="Modifier"
                          onClick={() => openEditDialog(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 shrink-0"
                          title="Supprimer"
                          onClick={() => { setSelectedEvent(event); setDialogAction('delete') }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {!event.archive && (
                        <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleMarkTerminated(event)}>
                          <Archive className="mr-2 h-4 w-4" /> Marquer terminé
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!isLoading && filteredEvents.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-gray-500">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredEvents.length)} sur {filteredEvents.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                  Précédent
                </Button>
                <span className="text-sm text-gray-600">Page {safePage} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                  Suivant
                </Button>
              </div>
            </div>
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
              <Label>Photo événement (optionnel)</Label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
              />
              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Aperçu photo événement"
                  className="w-full max-h-48 rounded-md border object-cover"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
            </div>
            <p className="text-sm text-muted-foreground">
              Les nouveaux événements sont créés comme ouverts. Vous pourrez ensuite les marquer "terminés".
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); resetForm() }}>Annuler</Button>
            <Button
              onClick={dialogAction === 'create' ? handleCreate : handleUpdate}
              disabled={isSubmitting || !formData.titre || !formData.date || !formData.heure || !formData.lieu || !formData.description}
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
