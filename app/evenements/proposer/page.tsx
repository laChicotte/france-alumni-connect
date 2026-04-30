'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TypeEvenement } from '@/types/database.types'

function generateSlug(titre: string) {
  return titre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
}

export default function ProposerEvenementPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [types, setTypes] = useState<TypeEvenement[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titre: '',
    date: '',
    heure: '',
    lieu: '',
    type_evenement_id: '',
    description: '',
    places_max: '',
    lien_visio: '',
  })

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/connexion'); return }
      setUserId(session.user.id)
      setIsCheckingAuth(false)
    }
    init()
    supabase.from('types_evenements').select('*').order('ordre').then(({ data }) => {
      setTypes(data || [])
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setIsSubmitting(true)
    try {
      let imageUrl = '/placeholder.svg'
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/event_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('evenements-media')
          .upload(path, imageFile, { contentType: imageFile.type, upsert: true })
        if (!uploadError && uploadData) {
          imageUrl = supabase.storage.from('evenements-media').getPublicUrl(uploadData.path).data.publicUrl
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/alumni/evenements/proposer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          titre: formData.titre.trim(),
          date: formData.date,
          heure: formData.heure,
          lieu: formData.lieu.trim(),
          type_evenement_id: formData.type_evenement_id || null,
          description: formData.description.trim(),
          image_url: imageUrl,
          places_max: formData.places_max || null,
          lien_visio: formData.lien_visio.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) { alert(`Erreur : ${json.error || 'Erreur serveur'}`); return }
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Une erreur est survenue, veuillez réessayer.')
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
            Votre événement a bien été soumis. L&apos;équipe France Alumni Guinée va l&apos;examiner et le publier après validation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild variant="outline">
              <Link href="/evenements"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux événements</Link>
            </Button>
            <Button className="bg-[#3558A2] hover:bg-[#3558A2]/90" onClick={() => {
              setSubmitted(false)
              setFormData({ titre: '', date: '', heure: '', lieu: '', type_evenement_id: '', description: '', places_max: '', lien_visio: '' })
              setImageFile(null)
              setImagePreviewUrl(null)
            }}>
              Proposer un autre événement
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="relative mx-4 mt-6 h-[220px] overflow-hidden rounded-3xl sm:mx-6 lg:mx-8">
        <Image src="/evenements/evenements.jpg" alt="Proposer un événement" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-8 px-10 sm:px-20 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl">
            proposer un événement
          </h1>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 mt-2">
        <Link href="/evenements" className="inline-flex items-center text-sm text-muted-foreground hover:text-[#3558A2] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux événements
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Votre proposition d&apos;événement</CardTitle>
            <p className="text-sm text-muted-foreground">
              Votre proposition sera examinée par l&apos;équipe avant publication. Les champs marqués * sont obligatoires.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Conférence sur l'entrepreneuriat en Guinée"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heure">Heure * <span className="text-muted-foreground text-xs">(GMT)</span></Label>
                  <Input id="heure" type="time" value={formData.heure} onChange={e => setFormData({ ...formData, heure: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lieu">Lieu *</Label>
                  <Input id="lieu" value={formData.lieu} onChange={e => setFormData({ ...formData, lieu: e.target.value })} placeholder="Ex: Institut Français de Guinée" required />
                </div>
                <div className="space-y-2">
                  <Label>Type d&apos;événement <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                  <Select value={formData.type_evenement_id} onValueChange={v => setFormData({ ...formData, type_evenement_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {types.map(t => <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="places_max">Nombre de places <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                  <Input id="places_max" type="number" min="1" value={formData.places_max} onChange={e => setFormData({ ...formData, places_max: e.target.value })} placeholder="Illimité si vide" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lien_visio">Lien visio <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                  <Input id="lien_visio" type="url" value={formData.lien_visio} onChange={e => setFormData({ ...formData, lien_visio: e.target.value })} placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Photo de l&apos;événement *</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    setImageFile(file)
                    setImagePreviewUrl(file ? URL.createObjectURL(file) : null)
                  }}
                />
                {imagePreviewUrl && (
                  <img src={imagePreviewUrl} alt="Aperçu" className="w-full max-h-48 rounded-md border object-cover" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez votre événement, ses objectifs, le public visé..."
                  required
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Votre proposition sera soumise à validation avant d&apos;être publiée sur la plateforme.
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/evenements">Annuler</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#3558A2] hover:bg-[#3558A2]/90"
                  disabled={isSubmitting || !formData.titre || !formData.date || !formData.heure || !formData.lieu || !formData.description || !imageFile}
                >
                  {isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</>
                    : 'Soumettre ma proposition'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
