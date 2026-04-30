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
import type { CategorieArticle } from '@/types/database.types'
import { RichTextEditor } from '@/components/admin/articles/rich-text-editor'

function generateSlug(titre: string) {
  return titre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
}

export default function ProposerArticlePage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategorieArticle[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titre: '',
    extrait: '',
    contenu: '<p></p>',
    categorie_id: '',
  })

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/connexion'); return }
      setUserId(session.user.id)
      setIsCheckingAuth(false)
    }
    init()
    supabase.from('categories_articles').select('*').order('libelle').then(({ data }) => {
      setCategories(data || [])
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
        const path = `${userId}/article_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('articles-media')
          .upload(path, imageFile, { contentType: imageFile.type, upsert: true })
        if (!uploadError && uploadData) {
          imageUrl = supabase.storage.from('articles-media').getPublicUrl(uploadData.path).data.publicUrl
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/alumni/articles/proposer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          titre: formData.titre.trim(),
          extrait: formData.extrait.trim() || null,
          contenu: formData.contenu.trim(),
          image_couverture_url: imageUrl,
          categorie_id: formData.categorie_id || null,
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
            Votre article a bien été soumis. L&apos;équipe France Alumni Guinée va l&apos;examiner et le publier après validation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild variant="outline">
              <Link href="/actualites"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux actualités</Link>
            </Button>
            <Button className="bg-[#3558A2] hover:bg-[#3558A2]/90" onClick={() => {
              setSubmitted(false)
              setFormData({ titre: '', extrait: '', contenu: '', categorie_id: '' })
              setImageFile(null)
              setImagePreviewUrl(null)
            }}>
              Proposer un autre article
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="relative mx-4 mt-6 h-[220px] overflow-hidden rounded-3xl sm:mx-6 lg:mx-8">
        <Image src="/actualites/actualites2.jpg" alt="Proposer un article" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-8 px-10 sm:px-20 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl">
            proposer un article
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 mt-2">
        <Link href="/actualites" className="inline-flex items-center text-sm text-muted-foreground hover:text-[#3558A2] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux actualités
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Votre proposition d&apos;article</CardTitle>
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
                  placeholder="Ex: Les opportunités d'investissement en Guinée"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Catégorie <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                <Select value={formData.categorie_id} onValueChange={v => setFormData({ ...formData, categorie_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.libelle}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Image de couverture *</Label>
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
                <Label htmlFor="extrait">Résumé <span className="text-muted-foreground text-xs">(optionnel — affiché dans la liste)</span></Label>
                <Textarea
                  id="extrait"
                  value={formData.extrait}
                  onChange={e => setFormData({ ...formData, extrait: e.target.value })}
                  rows={2}
                  placeholder="Une courte description de votre article..."
                />
              </div>

              <div className="space-y-2">
                <Label>Contenu de l&apos;article *</Label>
                <div className="border rounded-md overflow-hidden">
                  <RichTextEditor
                    value={formData.contenu}
                    onChange={v => setFormData({ ...formData, contenu: v })}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Votre proposition sera soumise à validation avant d&apos;être publiée sur la plateforme.
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/actualites">Annuler</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#3558A2] hover:bg-[#3558A2]/90"
                  disabled={isSubmitting || !formData.titre || !formData.contenu || formData.contenu === '<p></p>' || !imageFile}
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
