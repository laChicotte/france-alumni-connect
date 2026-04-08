"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CalendarDays, Eye, Loader2, Save, UserCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Article, ArticleMediaType, CategorieArticle } from "@/types/database.types"
import { RichTextEditor } from "@/components/admin/articles/rich-text-editor"
import { ArticleContentRenderer } from "@/components/admin/articles/article-content-renderer"
import { Alert, AlertDescription } from "@/components/ui/alert"

/** Limite côté app (inférieure au plafond bucket Supabase 10 Mo) */
const MAX_ARTICLE_MEDIA_BYTES = 5 * 1024 * 1024

type PreviewMode = "edit" | "preview" | "split"

interface EndMediaItem {
  id: string
  media_type: ArticleMediaType
  media_url: string
  ordre: number
  file: File | null
}

interface ArticleEditorScreenProps {
  articleId?: string
}

export function ArticleEditorScreen({ articleId }: ArticleEditorScreenProps) {
  const router = useRouter()
  const isEdit = Boolean(articleId)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategorieArticle[]>([])
  const [previewMode, setPreviewMode] = useState<PreviewMode>("split")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string; nom?: string; prenom?: string } | null>(null)
  const [endMediaItems, setEndMediaItems] = useState<EndMediaItem[]>([])
  const [articlePublicationDate, setArticlePublicationDate] = useState<string | null>(null)
  const [uploadSizeError, setUploadSizeError] = useState<string | null>(null)
  const [coverFileInputKey, setCoverFileInputKey] = useState(0)

  const [formData, setFormData] = useState({
    titre: "",
    slug: "",
    extrait: "",
    contenu: "<p></p>",
    image_couverture_url: "",
    categorie_id: "",
    status: "brouillon" as "brouillon" | "publie",
  })

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser({ id: user.id, role: user.role, nom: user.nom, prenom: user.prenom })
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!isEdit || !articleId) return
    fetchArticle(articleId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, isEdit])

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories_articles").select("*").order("ordre")
    setCategories(data || [])
  }

  const fetchArticle = async (id: string) => {
    setIsLoading(true)
    const { data: article, error } = await (supabase.from("articles") as any)
      .select("*")
      .eq("id", id)
      .single()

    if (!error && article) {
      setFormData({
        titre: article.titre,
        slug: article.slug,
        extrait: article.extrait || "",
        contenu: article.contenu || "<p></p>",
        image_couverture_url: article.image_couverture_url || "",
        categorie_id: article.categorie_id || "",
        status: article.status,
      })
      setCoverPreviewUrl(article.image_couverture_url || null)
      setArticlePublicationDate(article.date_publication || null)
    }

    const { data: mediaData } = await (supabase.from("article_media") as any)
      .select("*")
      .eq("article_id", id)
      .order("ordre", { ascending: true })

    setEndMediaItems(
      (mediaData || []).map((item: any) => ({
        id: item.id,
        media_type: item.media_type,
        media_url: item.media_url,
        ordre: item.ordre,
        file: null,
      }))
    )

    setIsLoading(false)
  }

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  const onSelectCoverFile = (file: File | null) => {
    if (file && file.size > MAX_ARTICLE_MEDIA_BYTES) {
      setUploadSizeError("L'image de couverture ne doit pas dépasser 5 Mo.")
      setCoverFileInputKey((k) => k + 1)
      setCoverFile(null)
      setCoverPreviewUrl(formData.image_couverture_url || null)
      return
    }
    setUploadSizeError(null)
    setCoverFile(file)
    if (!file) {
      setCoverPreviewUrl(formData.image_couverture_url || null)
      return
    }
    setCoverPreviewUrl(URL.createObjectURL(file))
  }

  const addMedia = (type: ArticleMediaType) => {
    setEndMediaItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        media_type: type,
        media_url: "",
        ordre: prev.length + 1,
        file: null,
      },
    ])
  }

  const updateMedia = (id: string, patch: Partial<EndMediaItem>) => {
    setEndMediaItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeMedia = (id: string) => {
    setEndMediaItems((prev) => prev.filter((item) => item.id !== id).map((item, idx) => ({ ...item, ordre: idx + 1 })))
  }

  const uploadToArticlesMedia = async (file: File, segment: string) => {
    if (!currentUser?.id) throw new Error("Utilisateur non connecté")
    if (file.size > MAX_ARTICLE_MEDIA_BYTES) {
      throw new Error("Fichier trop volumineux (max 5 Mo)")
    }
    const ext = file.name.split(".").pop() || "bin"
    const path = `${currentUser.id}/${segment}_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from("articles-media").upload(path, file, {
      contentType: file.type,
      upsert: true,
    })
    if (error || !data) throw error || new Error("Upload échoué")
    const { data: publicData } = supabase.storage.from("articles-media").getPublicUrl(data.path)
    return publicData.publicUrl
  }

  const syncArticleMedia = async (id: string) => {
    const { error: deleteError } = await (supabase.from("article_media") as any).delete().eq("article_id", id)
    if (deleteError) throw deleteError

    const rows = await Promise.all(
      endMediaItems.map(async (item, idx) => {
        let url = item.media_url
        if (item.file) {
          url = await uploadToArticlesMedia(item.file, `article_${id}_end_${idx + 1}`)
        }
        return {
          article_id: id,
          media_type: item.media_type,
          media_url: url,
          ordre: idx + 1,
        }
      })
    )

    const validRows = rows.filter((row) => row.media_url.trim() !== "")
    if (validRows.length > 0) {
      const { error: insertError } = await (supabase.from("article_media") as any).insert(validRows)
      if (insertError) throw insertError
    }
  }

  const handleSave = async (targetStatus?: "brouillon" | "publie") => {
    if (!formData.titre || !formData.contenu) return
    if (!coverFile && !formData.image_couverture_url) return

    if (coverFile && coverFile.size > MAX_ARTICLE_MEDIA_BYTES) {
      setUploadSizeError("L'image de couverture ne doit pas dépasser 5 Mo.")
      return
    }
    const oversizedMedia = endMediaItems.find((item) => item.file && item.file.size > MAX_ARTICLE_MEDIA_BYTES)
    if (oversizedMedia?.file) {
      setUploadSizeError(`Un média dépasse 5 Mo : ${oversizedMedia.file.name}`)
      return
    }
    setUploadSizeError(null)

    setIsSubmitting(true)
    try {
      let coverUrl = formData.image_couverture_url
      if (coverFile) {
        coverUrl = await uploadToArticlesMedia(coverFile, `cover_${formData.slug || "article"}`)
      }

      const finalStatus = targetStatus || formData.status
      const payload = {
        titre: formData.titre,
        slug: formData.slug || generateSlug(formData.titre),
        extrait: formData.extrait || null,
        contenu: formData.contenu,
        image_couverture_url: coverUrl,
        categorie_id: formData.categorie_id || null,
        status: finalStatus,
      }

      let savedId = articleId
      if (isEdit && articleId) {
        const { error } = await (supabase.from("articles") as any)
          .update({
            ...payload,
            date_publication:
              finalStatus === "publie" && formData.status !== "publie" ? new Date().toISOString() : undefined,
          })
          .eq("id", articleId)
        if (error) throw error
        if (finalStatus === "publie") {
          setArticlePublicationDate(new Date().toISOString())
        }
      } else {
        const { data, error } = await (supabase.from("articles") as any)
          .insert({
            ...payload,
            auteur_id: currentUser?.id || null,
            date_publication: finalStatus === "publie" ? new Date().toISOString() : null,
          })
          .select("id")
          .single()
        if (error || !data) throw error || new Error("Création article échouée")
        savedId = data.id
        if (finalStatus === "publie") {
          setArticlePublicationDate(new Date().toISOString())
        }
      }

      if (!savedId) throw new Error("ID article manquant")
      await syncArticleMedia(savedId)
      router.push("/admin/articles")
    } catch (error) {
      console.error("Erreur sauvegarde article:", error)
      const msg = error instanceof Error ? error.message : ""
      if (msg.includes("5 Mo") || msg.toLowerCase().includes("too large") || msg.includes("413")) {
        setUploadSizeError(msg || "Fichier trop volumineux (max 5 Mo)")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewMedia = useMemo(
    () =>
      endMediaItems
        .map((item) => ({
          ...item,
          url: item.file ? URL.createObjectURL(item.file) : item.media_url,
        }))
        .filter((item) => item.url),
    [endMediaItems]
  )

  const authorLabel = useMemo(() => {
    const full = `${currentUser?.prenom || ""} ${currentUser?.nom || ""}`.trim()
    return full || "admin_ifg"
  }, [currentUser])

  const publicationLabel = useMemo(() => {
    const sourceDate = articlePublicationDate || (formData.status === "publie" ? new Date().toISOString() : null)
    if (!sourceDate) return "Non publié"
    return new Date(sourceDate).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }, [articlePublicationDate, formData.status])

  if (isLoading) {
    return (
      <AdminWrapper>
        <div className="p-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AdminWrapper>
    )
  }

  return (
    <AdminWrapper>
      <div className="p-6 space-y-4">
        {uploadSizeError && (
          <Alert variant="destructive">
            <AlertDescription>{uploadSizeError}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/admin/articles")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>
            <h1 className="text-2xl font-bold">{isEdit ? "Modifier l'article" : "Nouvel article"}</h1>
            <Badge variant={formData.status === "publie" ? "default" : "outline"}>
              {formData.status === "publie" ? "Publié" : "Brouillon"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewMode("edit")}>Edition</Button>
            <Button variant="outline" onClick={() => setPreviewMode("preview")}><Eye className="h-4 w-4 mr-1" />Aperçu</Button>
            <Button variant="outline" onClick={() => setPreviewMode("split")}>Split</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {(previewMode === "edit" || previewMode === "split") && (
            <Card className={previewMode === "split" ? "xl:col-span-2" : "xl:col-span-3"}>
              <CardHeader>
                <CardTitle>Edition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[78vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    value={formData.titre}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, titre: e.target.value, slug: generateSlug(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label>Image de couverture *</Label>
                  <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP — max 5 Mo</p>
                  <Input
                    key={coverFileInputKey}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => onSelectCoverFile(e.target.files?.[0] || null)}
                  />
                  {coverPreviewUrl && <img src={coverPreviewUrl} alt="Couverture" className="w-full rounded-lg border max-h-64 object-cover" />}
                </div>

                <div className="space-y-2">
                  <Label>Extrait</Label>
                  <Textarea value={formData.extrait} onChange={(e) => setFormData((prev) => ({ ...prev, extrait: e.target.value }))} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Contenu *</Label>
                  <RichTextEditor value={formData.contenu} onChange={(html) => setFormData((prev) => ({ ...prev, contenu: html }))} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Médias de fin</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Chaque fichier (image ou vidéo) — max 5 Mo</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => addMedia("image")}>+ Image</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => addMedia("video")}>+ Vidéo</Button>
                    </div>
                  </div>
                  {endMediaItems.map((item, idx) => (
                    <div key={item.id} className="rounded-md border p-3 space-y-2">
                      <div className="text-sm font-medium">Media #{idx + 1}</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Select value={item.media_type} onValueChange={(v: ArticleMediaType) => updateMedia(item.id, { media_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Vidéo</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="URL média"
                          value={item.media_url}
                          onChange={(e) => updateMedia(item.id, { media_url: e.target.value })}
                        />
                        <Input
                          type="file"
                          accept={item.media_type === "image" ? "image/png,image/jpeg,image/jpg,image/webp" : "video/mp4,video/webm"}
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null
                            if (f && f.size > MAX_ARTICLE_MEDIA_BYTES) {
                              setUploadSizeError(`Le média ne doit pas dépasser 5 Mo : ${f.name}`)
                              e.target.value = ""
                              return
                            }
                            setUploadSizeError(null)
                            updateMedia(item.id, { file: f })
                          }}
                        />
                      </div>
                      <Button type="button" variant="ghost" className="text-red-600" onClick={() => removeMedia(item.id)}>Retirer</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(previewMode === "preview" || previewMode === "split") && (
            <Card className={previewMode === "split" ? "xl:col-span-1" : "xl:col-span-3"}>
              <CardHeader>
                <CardTitle>Aperçu final lecteur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[78vh] overflow-y-auto pr-2">
                <div className="mx-auto max-w-4xl border-2 border-[#3558A2] bg-white p-6 md:p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <img src="/logo/logo_alumni_bleu.png" alt="France Alumni" className="h-16 w-auto object-contain" />
                  </div>

                  <h2 className="mb-3 text-center text-3xl font-bold leading-tight text-gray-900">
                    {formData.titre || "Titre de l'article"}
                  </h2>

                  <div className="mb-5 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <UserCircle2 className="h-4 w-4 text-[#3558A2]" />
                      {authorLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-4 w-4 text-[#3558A2]" />
                      {publicationLabel}
                    </span>
                  </div>

                  {formData.extrait && (
                    <p className="mb-6 text-center text-lg text-gray-700">{formData.extrait}</p>
                  )}

                  {coverPreviewUrl && (
                    <img
                      src={coverPreviewUrl}
                      alt="Couverture"
                      className="mb-8 w-full rounded-lg border object-cover"
                    />
                  )}

                  <ArticleContentRenderer html={formData.contenu} />

                  {previewMedia.length > 0 && (
                    <div className="mt-8">
                      <h3 className="mb-3 text-lg font-semibold">Médias</h3>
                      <div className="overflow-x-auto pb-2">
                        <div className="flex gap-4 snap-x snap-mandatory">
                          {previewMedia.map((item) => (
                            <div key={item.id} className="min-w-[260px] max-w-[320px] shrink-0 snap-start">
                              {item.media_type === "image" ? (
                                <img
                                  src={item.url}
                                  alt="Media article"
                                  className="h-44 w-full rounded-lg border object-cover"
                                />
                              ) : (
                                <video src={item.url} controls className="h-44 w-full rounded-lg border object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={formData.categorie_id} onValueChange={(v) => setFormData((prev) => ({ ...prev, categorie_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.libelle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: "brouillon" | "publie") => setFormData((prev) => ({ ...prev, status: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" disabled={isSubmitting} onClick={() => handleSave("brouillon")}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Enregistrer brouillon
              </Button>
              <Button disabled={isSubmitting} onClick={() => handleSave("publie")}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Publier
              </Button>
              {isEdit && (
                <Button variant="secondary" disabled={isSubmitting} onClick={() => handleSave("brouillon")}>
                  Suspendre
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminWrapper>
  )
}

