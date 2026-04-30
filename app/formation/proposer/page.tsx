"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { TypeFormation } from "@/types/database.types"


export default function ProposerFormationPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)
  const [types, setTypes] = useState<TypeFormation[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titre: "",
    date_debut: "", date_fin: "",
    heure_debut: "", heure_fin: "",
    lieu: "", lien_visio: "",
    type_formation_id: "",
    description: "", programme: "",
    places_max: "",
    niveau: "",
    gratuit: true, prix: "",
  })

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session
      if (!session) {
        router.push("/connexion")
        return
      }
      const stored = localStorage.getItem("user")
      if (stored) setCurrentUser(JSON.parse(stored))
      setIsCheckingAuth(false)
    }
    init()

    supabase.from("types_formations").select("*").order("ordre").then(({ data }) => {
      setTypes((data || []) as TypeFormation[])
    })
  }, [router])

  const handleImageSelect = (file: File | null) => {
    setImageFile(file)
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsSubmitting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) { router.push("/connexion"); return }

      let imageUrl = ""
      if (imageFile) {
        const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg"
        const path = `${currentUser.id}/formation_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("formations-media")
          .upload(path, imageFile, { contentType: imageFile.type, upsert: true })
        if (!uploadError && uploadData) {
          imageUrl = supabase.storage.from("formations-media").getPublicUrl(uploadData.path).data.publicUrl
        }
      }

      const res = await fetch('/api/alumni/formations/proposer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          titre: formData.titre.trim(),
          date_debut: formData.date_debut,
          date_fin: formData.date_fin || null,
          heure_debut: formData.heure_debut,
          heure_fin: formData.heure_fin || null,
          lieu: formData.lieu.trim(),
          lien_visio: formData.lien_visio.trim() || null,
          type_formation_id: formData.type_formation_id || null,
          description: formData.description.trim(),
          programme: formData.programme.trim() || null,
          image_url: imageUrl,
          places_max: formData.places_max || null,
          niveau: formData.niveau || null,
          gratuit: formData.gratuit,
          prix: !formData.gratuit && formData.prix ? formData.prix : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        alert(`Erreur : ${json.error || 'Erreur serveur'}`)
        return
      }

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert("Une erreur est survenue, veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3558A2]" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="font-serif text-2xl font-bold">Proposition envoyée !</h1>
          <p className="text-muted-foreground">
            Votre formation a bien été soumise. L&apos;équipe France Alumni Guinée va l&apos;examiner et la publier après validation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild variant="outline">
              <Link href="/formation"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux formations</Link>
            </Button>
            <Button className="bg-[#3558A2] hover:bg-[#3558A2]/90" onClick={() => { setSubmitted(false); setFormData({ titre: "", date_debut: "", date_fin: "", heure_debut: "", heure_fin: "", lieu: "", lien_visio: "", type_formation_id: "", description: "", programme: "", places_max: "", niveau: "", gratuit: true, prix: "" }); setImageFile(null); setImagePreviewUrl(null) }}>
              Proposer une autre formation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="relative mx-4 mt-6 h-[220px] overflow-hidden rounded-3xl sm:mx-6 lg:mx-8">
        <Image src="/formation/formation1.jpg" alt="Proposer une formation" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-8 px-10 sm:px-20 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl">
            proposer une formation
          </h1>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 mt-2">
        <Link href="/formation" className="inline-flex items-center text-sm text-muted-foreground hover:text-[#3558A2] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux formations
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Votre proposition de formation</CardTitle>
            <p className="text-sm text-muted-foreground">
              Votre proposition sera examinée par l&apos;équipe avant publication. Tous les champs marqués * sont obligatoires.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="titre">Titre de la formation *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Initiation à la création d'entreprise en Guinée"
                  required
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_debut">Date début *</Label>
                  <Input id="date_debut" type="date" value={formData.date_debut} onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_fin">Date fin <span className="text-muted-foreground text-xs">(si multi-jours)</span></Label>
                  <Input id="date_fin" type="date" value={formData.date_fin} onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })} />
                </div>
              </div>

              {/* Heures */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heure_debut">Heure début * <span className="text-muted-foreground text-xs font-normal">(GMT)</span></Label>
                  <Input id="heure_debut" type="time" value={formData.heure_debut} onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heure_fin">Heure fin <span className="text-muted-foreground text-xs font-normal">(GMT)</span></Label>
                  <Input id="heure_fin" type="time" value={formData.heure_fin} onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })} />
                </div>
              </div>

              {/* Lieu */}
              <div className="space-y-2">
                <Label htmlFor="lieu">Lieu *</Label>
                <Input id="lieu" value={formData.lieu} onChange={(e) => setFormData({ ...formData, lieu: e.target.value })} placeholder="Ex: Institut Français de Guinée, Conakry" required />
              </div>

              {/* Lien visio */}
              <div className="space-y-2">
                <Label htmlFor="lien_visio">Lien visioconférence <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                <Input id="lien_visio" type="url" value={formData.lien_visio} onChange={(e) => setFormData({ ...formData, lien_visio: e.target.value })} placeholder="https://..." />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type de formation *</Label>
                <Select value={formData.type_formation_id} onValueChange={(v) => setFormData({ ...formData, type_formation_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {types.map((t) => <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Places + Tarif */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="places_max">Nombre de places <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                  <Input id="places_max" type="number" min="1" value={formData.places_max} onChange={(e) => setFormData({ ...formData, places_max: e.target.value })} placeholder="Illimité si vide" />
                </div>
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
              </div>

              {/* Prix si payant */}
              {!formData.gratuit && (
                <div className="space-y-2">
                  <Label htmlFor="prix">Montant (GNF) *</Label>
                  <Input id="prix" type="number" step="1" min="0" value={formData.prix} onChange={(e) => setFormData({ ...formData, prix: e.target.value })} placeholder="Ex: 500 000" required={!formData.gratuit} />
                </div>
              )}

              {/* Photo */}
              <div className="space-y-2">
                <Label>Photo de la formation *</Label>
                <Input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => handleImageSelect(e.target.files?.[0] || null)} />
                {imagePreviewUrl && (
                  <img src={imagePreviewUrl} alt="Aperçu" className="w-full max-h-48 rounded-md border object-cover" />
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez votre formation, ses objectifs, le public visé..."
                  required
                />
              </div>

              {/* Programme */}
              <div className="space-y-2">
                <Label htmlFor="programme">Programme détaillé <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                <Textarea
                  id="programme"
                  value={formData.programme}
                  onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                  rows={4}
                  placeholder="Ex: Matin — Introduction et théorie. Après-midi — Exercices pratiques..."
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Votre proposition sera soumise à validation avant d&apos;être publiée sur la plateforme.
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/formation">Annuler</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#3558A2] hover:bg-[#3558A2]/90"
                  disabled={isSubmitting || !formData.titre || !formData.date_debut || !formData.heure_debut || !formData.lieu || !formData.description || !formData.type_formation_id || !imageFile}
                >
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</> : "Soumettre ma proposition"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
