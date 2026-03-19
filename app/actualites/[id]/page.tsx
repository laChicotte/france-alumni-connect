"use client"

import Image from "next/image"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { articles } from "@/lib/fake-data"
import { ArrowLeft, CalendarDays, Loader2, UserCircle2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ArticleContentRenderer } from "@/components/admin/articles/article-content-renderer"

type PublicArticle = {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  author: string
  date: string
  media: Array<{
    id: string
    media_type: "image" | "video"
    media_url: string
    ordre: number
  }>
}

export default function ArticlePage() {
  const params = useParams()
  const articleId = params.id as string
  const fallbackArticle = useMemo(() => articles.find((a) => a.id === articleId), [articleId])

  const [article, setArticle] = useState<PublicArticle | null>(
    fallbackArticle
      ? {
          id: fallbackArticle.id,
          title: fallbackArticle.title,
          excerpt: fallbackArticle.excerpt,
          content: fallbackArticle.content,
          image: fallbackArticle.image || "/placeholder.svg",
          author: fallbackArticle.author,
          date: fallbackArticle.date,
          media: [],
        }
      : null
  )
  const [isLoading, setIsLoading] = useState(!fallbackArticle)

  useEffect(() => {
    if (fallbackArticle) return

    const loadArticle = async () => {
      try {
        const res = await fetch(`/api/articles/public/${articleId}`, { cache: "no-store" })
        if (!res.ok) {
          setArticle(null)
          setIsLoading(false)
          return
        }
        const data = await res.json()
        const apiArticle = data?.article
        if (!apiArticle) {
          setArticle(null)
          setIsLoading(false)
          return
        }

        setArticle({
          id: apiArticle.id,
          title: apiArticle.titre,
          excerpt: apiArticle.extrait || "",
          content: apiArticle.contenu || "",
          image: apiArticle.image_couverture_url || "/placeholder.svg",
          author:
            `${data?.author?.prenom || ""} ${data?.author?.nom || ""}`.trim() ||
            "France Alumni",
          date: new Date(apiArticle.date_publication || apiArticle.created_at).toLocaleDateString(
            "fr-FR",
            { day: "2-digit", month: "2-digit", year: "numeric" }
          ),
          media: Array.isArray(data?.media) ? data.media : [],
        })
      } catch {
        setArticle(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticle()
  }, [articleId, fallbackArticle])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3558A2]" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">Article non trouvé</h1>
          <Link href="/actualites">
            <Button>Retour aux actualités</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/actualites">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux actualités
          </Button>
        </Link>

        <div className="mx-auto max-w-6xl border-2 border-[#3558A2] bg-white p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between">
            <Image src="/logo/logo_alumni_bleu.png" alt="France Alumni" width={80} height={64} className="h-16 w-auto object-contain" />
          </div>

          <h1 className="mb-3 text-center text-3xl font-bold leading-tight text-gray-900">
            {article.title}
          </h1>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <UserCircle2 className="h-4 w-4 text-[#3558A2]" />
              {article.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-[#3558A2]" />
              {article.date}
            </span>
          </div>

          {article.excerpt && (
            <p className="mb-6 text-center text-lg text-gray-700">{article.excerpt}</p>
          )}

          <img
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            className="mb-8 mx-auto block h-auto max-h-[520px] w-[80%] rounded-lg border object-cover"
          />

          <ArticleContentRenderer html={article.content} />

          {article.media.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold">Médias</h3>
              <div className="overflow-x-auto pb-2">
                <div className="mx-auto flex w-max gap-4 snap-x snap-mandatory">
                  {article.media.map((item) => (
                    <div key={item.id} className="min-w-[260px] max-w-[320px] shrink-0 snap-start">
                      {item.media_type === "image" ? (
                        <img
                          src={item.media_url}
                          alt="Media article"
                          className="h-44 w-full rounded-lg border object-cover"
                        />
                      ) : (
                        <video
                          src={item.media_url}
                          controls
                          className="h-44 w-full rounded-lg border object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
