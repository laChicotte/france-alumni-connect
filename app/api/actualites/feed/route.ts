import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export const revalidate = 120 // 2 minutes

type FeedItem = {
  id: string
  title: string
  image: string
  author: string
  category: string
  created_at: string
  href: string
  epingle?: boolean
}

function formatAddedDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    // Requête unique avec jointures (catégorie + auteur en une seule passe)
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select(`
        id, titre, image_couverture_url, created_at, date_publication, epingle,
        categories_articles(id, libelle),
        users(id, nom, prenom)
      `)
      .eq("status", "publie")
      .order("epingle", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100)

    if (articlesError) {
      return NextResponse.json({ error: articlesError.message }, { status: 500 })
    }

    const { data: events, error: eventsError } = await supabase
      .from("evenements")
      .select("id, titre, image_url, date, created_at")
      .order("created_at", { ascending: false })
      .limit(100)

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const articleItems: FeedItem[] = (articles || []).map((article: any) => ({
      id: article.id,
      title: article.titre,
      image: article.image_couverture_url || "/placeholder.svg",
      author: article.users
        ? `${article.users.prenom || ""} ${article.users.nom || ""}`.trim() || "France Alumni"
        : "France Alumni",
      category: article.categories_articles?.libelle || "Actualités",
      created_at: article.date_publication || article.created_at,
      href: `/actualites/${article.id}`,
      epingle: article.epingle ?? false,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventItems: FeedItem[] = (events || []).map((event: any) => ({
      id: event.id,
      title: event.titre,
      image: event.image_url || "/placeholder.svg",
      author: "France Alumni",
      category: "Événements",
      created_at: event.date || event.created_at,
      href: `/actualites/${event.id}`,
    }))

    const items = [...articleItems, ...eventItems]
      .sort((a, b) => {
        if (a.epingle && !b.epingle) return -1
        if (!a.epingle && b.epingle) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .map((item) => ({
        ...item,
        date: formatAddedDate(item.created_at),
      }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Erreur feed actualités:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

