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
import { Search, Plus, Pencil, Trash2, Archive, Loader2, CalendarDays, MapPin, Clock3, Eye, Download, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Formation, TypeFormation, FormationStatut } from "@/types/database.types"
import { downloadCsv } from "@/lib/export/csv"

interface FormationWithType extends Formation {
  types_formations?: { libelle: string } | null
  inscriptions_count?: number
}

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"]
const PAGE_SIZE = 4

function statutBadge(statut: FormationStatut) {
  if (statut === "publiee") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publiée</Badge>
  if (statut === "en_attente") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En attente</Badge>
  return <Badge variant="secondary">Archivée</Badge>
}

function formatDateRange(debut: string, fin: string | null) {
  const d = new Date(debut).toLocaleDateString("fr-FR")
  if (!fin || fin === debut) return d
  return `${d} → ${new Date(fin).toLocaleDateString("fr-FR")}`
}

export default function FormationsAdminPage() {
  const [formations, setFormations] = useState<FormationWithType[]>([])
  const [types, setTypes] = useState<TypeFormation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatut, setFilterStatut] = useState("all")
  const [filterNiveau, setFilterNiveau] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFormation, setSelectedFormation] = useState<FormationWithType | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titre: "", slug: "",
    date_debut: "", date_fin: "",
    heure_debut: "", heure_fin: "",
    lieu: "", lien_visio: "",
    type_formation_id: "",
    description: "", programme: "",
    image_url: "", places_max: "",
    niveau: "", gratuit: true, prix: "",
    actif: true, statut: "publiee" as FormationStatut,
  })

  useEffect(() => {
    fetchFormations()
    fetchTypes()
    const user = localStorage.getItem("user")
    if (user) setCurrentUser(JSON.parse(user))
  }, [])

  useEffect(() => { setCurrentPage(1) }, [searchTerm, filterType, filterStatut, filterNiveau, startDate, endDate])

  const fetchFormations = async () => {
    setIsLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("formations").select("*, types_formations(libelle)") as any)
      .order("date_debut", { ascending: true })
    if (!error) {
      const list = (data || []) as FormationWithType[]
      const withCounts = await Promise.all(
        list.map(async (f) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { count } = await (supabase.from("inscriptions_formations") as any)
            .select("*", { count: "exact", head: true })
            .eq("formation_id", f.id)
          return { ...f, inscriptions_count: count || 0 }
        })
      )
      setFormations(withCounts)
    }
    setIsLoading(false)
  }

  const fetchTypes = async () => {
    const { data } = await supabase.from("types_formations").select("*").order("ordre")
    setTypes((data || []) as TypeFormation[])
  }

  const generateSlug = (titre: string) =>
    titre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const path = `${currentUser?.id || "unknown"}/formation_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from("formations-media").upload(path, file, { contentType: file.type, upsert: true })
    if (error || !data) throw error || new Error("Upload image échoué")
    return supabase.storage.from("formations-media").getPublicUrl(data.path).data.publicUrl
  }

  const handleImageSelect = (file: File | null) => {
    setImageFile(file)
    setImagePreviewUrl(file ? URL.createObjectURL(file) : formData.image_url || null)
  }

  const buildPayload = (imageUrl: string) => ({
    ...formData,
    image_url: imageUrl,
    slug: formData.slug || generateSlug(formData.titre),
    places_max: formData.places_max ? parseInt(formData.places_max) : null,
    date_fin: formData.date_fin || null,
    heure_fin: formData.heure_fin || null,
    lien_visio: formData.lien_visio || null,
    type_formation_id: formData.type_formation_id || null,
    niveau: formData.niveau || null,
    programme: formData.programme || null,
    prix: !formData.gratuit && formData.prix ? parseFloat(formData.prix) : null,
    proposee_par: currentUser?.id || null,
  })

  const handleCreate = async () => {
    setIsSubmitting(true)
    try {
      let imageUrl = "/placeholder.svg"
      if (imageFile) imageUrl = await uploadImage(imageFile)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("formations") as any).insert(buildPayload(imageUrl))
      if (!error) { fetchFormations(); setDialogAction(null); resetForm() }
      else alert(error.message)
    } catch (e) { console.error(e) }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!selectedFormation) return
    setIsSubmitting(true)
    try {
      let imageUrl = formData.image_url || selectedFormation.image_url || "/placeholder.svg"
      if (imageFile) imageUrl = await uploadImage(imageFile)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("formations") as any).update(buildPayload(imageUrl)).eq("id", selectedFormation.id)
      if (!error) { fetchFormations(); setDialogAction(null); resetForm() }
      else alert(error.message)
    } catch (e) { console.error(e) }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!selectedFormation) return
    setIsSubmitting(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("formations") as any).delete().eq("id", selectedFormation.id)
    if (!error) { fetchFormations(); setDialogAction(null); setSelectedFormation(null) }
    setIsSubmitting(false)
  }

  const handlePublier = async (f: FormationWithType) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("formations") as any).update({ statut: "publiee" }).eq("id", f.id)
    fetchFormations()
  }

  const handleArchiver = async (f: FormationWithType) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("formations") as any).update({ statut: "archivee", actif: false }).eq("id", f.id)
    fetchFormations()
  }

  const resetForm = () => {
    setFormData({
      titre: "", slug: "", date_debut: "", date_fin: "",
      heure_debut: "", heure_fin: "", lieu: "", lien_visio: "",
      type_formation_id: "", description: "", programme: "",
      image_url: "", places_max: "", niveau: "", gratuit: true, prix: "",
      actif: true, statut: "publiee",
    })
    setImageFile(null); setImagePreviewUrl(null); setSelectedFormation(null)
  }

  const openEditDialog = (f: FormationWithType) => {
    setSelectedFormation(f)
    setFormData({
      titre: f.titre, slug: f.slug,
      date_debut: f.date_debut, date_fin: f.date_fin || "",
      heure_debut: f.heure_debut, heure_fin: f.heure_fin || "",
      lieu: f.lieu, lien_visio: f.lien_visio || "",
      type_formation_id: f.type_formation_id || "",
      description: f.description, programme: f.programme || "",
      image_url: f.image_url, places_max: f.places_max?.toString() || "",
      niveau: f.niveau || "", gratuit: f.gratuit, prix: f.prix?.toString() || "",
      actif: f.actif, statut: f.statut,
    })
    setImageFile(null); setImagePreviewUrl(f.image_url || null)
    setDialogAction("edit")
  }

  const filtered = formations.filter((f) => {
    const matchSearch = f.titre.toLowerCase().includes(searchTerm.toLowerCase()) || f.lieu.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === "all" || f.type_formation_id === filterType
    const matchStatut = filterStatut === "all" || f.statut === filterStatut
    const matchNiveau = filterNiveau === "all" || f.niveau === filterNiveau
    const fDate = new Date(f.date_debut)
    const matchStart = !startDate || fDate >= new Date(`${startDate}T00:00:00`)
    const matchEnd = !endDate || fDate <= new Date(`${endDate}T23:59:59`)
    return matchSearch && matchType && matchStatut && matchNiveau && matchStart && matchEnd
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleExportFormationsCsv = async () => {
    const ids = filtered.map((f) => f.id)
    const countMap = new Map<string, number>()
    if (ids.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("inscriptions_formations") as any).select("formation_id").in("formation_id", ids)
      for (const r of (data || []) as Array<{ formation_id: string }>) {
        countMap.set(r.formation_id, (countMap.get(r.formation_id) || 0) + 1)
      }
    }
    const rows = filtered.map((f) => ({
      titre: f.titre, date_debut: f.date_debut, date_fin: f.date_fin || "",
      lieu: f.lieu, niveau: f.niveau || "", type: f.types_formations?.libelle || "",
      gratuit: f.gratuit ? "Oui" : "Non", prix: f.prix || "",
      places_max: f.places_max || "", inscrits: countMap.get(f.id) || 0, statut: f.statut,
    }))
    downloadCsv(`formations_${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  const handleExportParticipantsCsv = async () => {
    const ids = filtered.map((f) => f.id)
    if (!ids.length) return downloadCsv(`participants_formations_${new Date().toISOString().slice(0, 10)}.csv`, [])
    const titleById = new Map(filtered.map((f) => [f.id, f.titre]))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: regs } = await (supabase.from("inscriptions_formations") as any)
      .select("formation_id, user_id, nom_externe, prenom_externe, email_externe, organisation_externe, created_at")
      .in("formation_id", ids).order("created_at", { ascending: false })
    const registrations = (regs || []) as Array<any>
    const alumniIds = Array.from(new Set(registrations.map((r: any) => r.user_id).filter(Boolean) as string[]))
    const userById = new Map<string, { nom: string | null; prenom: string | null; email: string }>()
    if (alumniIds.length > 0) {
      const { data: usersData } = await supabase.from("users").select("id, nom, prenom, email").in("id", alumniIds)
      for (const u of (usersData || []) as Array<{ id: string; nom: string | null; prenom: string | null; email: string }>) {
        userById.set(u.id, u)
      }
    }
    const rows = registrations.map((r: any) => {
      if (r.user_id) {
        const u = userById.get(r.user_id)
        return { formation: titleById.get(r.formation_id) || "", type: "Alumni", nom: u?.nom || "", prenom: u?.prenom || "", email: u?.email || "", organisation: "", date_inscription: r.created_at }
      }
      return { formation: titleById.get(r.formation_id) || "", type: "Externe", nom: r.nom_externe || "", prenom: r.prenom_externe || "", email: r.email_externe || "", organisation: r.organisation_externe || "", date_inscription: r.created_at }
    })
    downloadCsv(`participants_formations_${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  const enAttenteCount = formations.filter((f) => f.statut === "en_attente").length

  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Formations</h1>
            <p className="text-gray-500">Gérez les formations de la communauté</p>
            {enAttenteCount > 0 && (
              <p className="mt-1 text-sm text-amber-600 font-medium">
                {enAttenteCount} proposition{enAttenteCount > 1 ? "s" : ""} en attente de validation
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleExportFormationsCsv}>
              <Download className="h-4 w-4 mr-2" /> Export CSV formations
            </Button>
            <Button variant="outline" onClick={handleExportParticipantsCsv}>
              <Download className="h-4 w-4 mr-2" /> Export CSV participants
            </Button>
            <Button onClick={() => { resetForm(); setDialogAction("create") }}>
              <Plus className="h-4 w-4 mr-2" /> Nouvelle formation
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {types.map((t) => <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="publiee">Publiées</SelectItem>
                  <SelectItem value="archivee">Archivées</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterNiveau} onValueChange={setFilterNiveau}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Niveau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  {NIVEAUX.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-[170px]" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-[170px]" />
            </div>
          </CardContent>
        </Card>

        {/* Liste */}
        <Card>
          <CardHeader><CardTitle>Formations ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Aucune formation trouvée</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {paginated.map((f) => (
                  <Card key={f.id} className={f.statut === "archivee" ? "opacity-70 border-dashed" : f.statut === "en_attente" ? "border-amber-300" : ""}>
                    <img src={f.image_url || "/placeholder.svg"} alt={f.titre} className="h-40 w-full object-cover rounded-t-lg" />
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge variant="outline">{f.types_formations?.libelle || "Formation"}</Badge>
                        <div className="flex gap-1.5">
                          
                          <Badge className={f.gratuit ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                          {f.gratuit ? "Gratuit" : f.prix ? `${f.prix} GNF` : "Payant"}
                          </Badge>
                          {statutBadge(f.statut)}
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg line-clamp-2">{f.titre}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{f.description}</p>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-4 w-4 text-[#3558A2]" />
                            {formatDateRange(f.date_debut, f.date_fin)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-4 w-4 text-[#3558A2]" />
                            {f.heure_debut}{f.heure_fin ? ` - ${f.heure_fin}` : ""}
                          </span>
                          <span className="text-xs">
                            Inscrits: {f.inscriptions_count || 0}{f.places_max ? ` / ${f.places_max}` : " (illimité)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-[#3558A2]" />
                          {f.lieu}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="icon" className="h-8 w-8" title="Voir inscrits">
                            <Link href={`/admin/formations/${f.id}/inscrits`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8" title="Modifier" onClick={() => openEditDialog(f)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" title="Supprimer" onClick={() => { setSelectedFormation(f); setDialogAction("delete") }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-1.5">
                          {f.statut === "en_attente" && (
                            <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50" onClick={() => handlePublier(f)}>
                              <CheckCircle2 className="mr-1 h-4 w-4" /> Publier
                            </Button>
                          )}
                          {f.statut === "publiee" && (
                            <Button variant="outline" size="sm" onClick={() => handleArchiver(f)}>
                              <Archive className="mr-1 h-4 w-4" /> Archiver
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!isLoading && filtered.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm text-gray-500">
                  {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} sur {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>Précédent</Button>
                  <span className="text-sm text-gray-600">Page {safePage} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Suivant</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Create/Edit */}
        <Dialog open={dialogAction === "create" || dialogAction === "edit"} onOpenChange={() => { setDialogAction(null); resetForm() }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{dialogAction === "create" ? "Nouvelle formation" : "Modifier la formation"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value, slug: generateSlug(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date début *</Label>
                  <Input type="date" value={formData.date_debut} onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date fin</Label>
                  <Input type="date" value={formData.date_fin} onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heure début *</Label>
                  <Input type="time" value={formData.heure_debut} onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Heure fin</Label>
                  <Input type="time" value={formData.heure_fin} onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lieu *</Label>
                  <Input value={formData.lieu} onChange={(e) => setFormData({ ...formData, lieu: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Lien visioconférence</Label>
                  <Input value={formData.lien_visio} onChange={(e) => setFormData({ ...formData, lien_visio: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type_formation_id} onValueChange={(v) => setFormData({ ...formData, type_formation_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{types.map((t) => <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Niveau</Label>
                  <Select value={formData.niveau} onValueChange={(v) => setFormData({ ...formData, niveau: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{NIVEAUX.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Places max</Label>
                  <Input type="number" value={formData.places_max} onChange={(e) => setFormData({ ...formData, places_max: e.target.value })} placeholder="Illimité si vide" />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={formData.statut} onValueChange={(v) => setFormData({ ...formData, statut: v as FormationStatut })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publiee">Publiée</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="archivee">Archivée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tarification</Label>
                  <Select value={formData.gratuit ? "gratuit" : "payant"} onValueChange={(v) => setFormData({ ...formData, gratuit: v === "gratuit", prix: v === "gratuit" ? "" : formData.prix })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gratuit">Gratuit</SelectItem>
                      <SelectItem value="payant">Payant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!formData.gratuit && (
                  <div className="space-y-2">
                    <Label>Prix (GNF)</Label>
                    <Input type="number" step="0.01" value={formData.prix} onChange={(e) => setFormData({ ...formData, prix: e.target.value })} placeholder="Ex: 50" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Photo (optionnel)</Label>
                <Input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => handleImageSelect(e.target.files?.[0] || null)} />
                {imagePreviewUrl && <img src={imagePreviewUrl} alt="Aperçu" className="w-full max-h-48 rounded-md border object-cover" />}
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Programme</Label>
                <Textarea value={formData.programme} onChange={(e) => setFormData({ ...formData, programme: e.target.value })} rows={3} placeholder="Détail du programme, sessions, objectifs..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogAction(null); resetForm() }}>Annuler</Button>
              <Button
                onClick={dialogAction === "create" ? handleCreate : handleUpdate}
                disabled={isSubmitting || !formData.titre || !formData.date_debut || !formData.heure_debut || !formData.lieu || !formData.description}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : dialogAction === "create" ? "Créer" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Delete */}
        <Dialog open={dialogAction === "delete"} onOpenChange={() => setDialogAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer la formation</DialogTitle>
              <DialogDescription>Voulez-vous vraiment supprimer cette formation ? Cette action est irréversible.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAction(null)}>Annuler</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminWrapper>
  )
}
