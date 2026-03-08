import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

type FeedItem = {
  id: string
  title: string
  image: string
  author: string
  category: string
  created_at: string
  href: string
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

    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("id, titre, image_couverture_url, created_at, auteur_id, categorie_id")
      .eq("status", "publie")
      .order("created_at", { ascending: false })
      .limit(100)

    if (articlesError) {
      return NextResponse.json({ error: articlesError.message }, { status: 500 })
    }

    const { data: events, error: eventsError } = await supabase
      .from("evenements")
      .select("id, titre, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(100)

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 })
    }

    const categoryIds = Array.from(
      new Set((articles || []).map((a) => a.categorie_id).filter((id): id is string => Boolean(id)))
    )
    const authorIds = Array.from(
      new Set((articles || []).map((a) => a.auteur_id).filter((id): id is string => Boolean(id)))
    )

    const [{ data: categories }, { data: users }] = await Promise.all([
      categoryIds.length > 0
        ? supabase.from("categories_articles").select("id, libelle").in("id", categoryIds)
        : Promise.resolve({ data: [] as Array<{ id: string; libelle: string }> }),
      authorIds.length > 0
        ? supabase.from("users").select("id, nom, prenom").in("id", authorIds)
        : Promise.resolve({ data: [] as Array<{ id: string; nom: string | null; prenom: string | null }> }),
    ])

    const categoryById = new Map((categories || []).map((c) => [c.id, c.libelle]))
    const authorById = new Map(
      (users || []).map((u) => [u.id, `${u.prenom || ""} ${u.nom || ""}`.trim() || "France Alumni"])
    )

    const articleItems: FeedItem[] = (articles || []).map((article) => ({
      id: article.id,
      title: article.titre,
      image: article.image_couverture_url || "/placeholder.svg",
      author: article.auteur_id ? authorById.get(article.auteur_id) || "France Alumni" : "France Alumni",
      category: article.categorie_id ? categoryById.get(article.categorie_id) || "Actualités" : "Actualités",
      created_at: article.created_at,
      href: `/actualites/${article.id}`,
    }))

    const eventItems: FeedItem[] = (events || []).map((event) => ({
      id: event.id,
      title: event.titre,
      image: event.image_url || "/placeholder.svg",
      author: "France Alumni",
      category: "Événements",
      created_at: event.created_at,
      href: `/actualites/${event.id}`,
    }))

    const items = [...articleItems, ...eventItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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

