import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export const revalidate = 120 // 2 minutes

type HomeArticle = {
  id: string
  title: string
  image: string
  category: string
  author: string
  date: string
}

type HomeEvent = {
  id: string
  title: string
  date: string
  time: string
  place: string
}

function formatDate(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("fr-FR")
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data: articlesData, error: articlesError } = await supabase
      .from("articles")
      .select("id, titre, image_couverture_url, created_at")
      .eq("status", "publie")
      .order("created_at", { ascending: false })
      .limit(3)

    if (articlesError) {
      return NextResponse.json({ error: articlesError.message }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const articles: HomeArticle[] = (articlesData || []).map((article: any) => ({
      id: article.id,
      title: article.titre,
      image: article.image_couverture_url || "/placeholder.svg",
      category: "Actualité",
      author: "France Alumni",
      date: formatDate(article.created_at),
    }))

    const { data: nonTerminatedData, error: nonTerminatedError } = await supabase
      .from("evenements")
      .select("id, titre, date, heure, lieu, archive, created_at")
      .eq("archive", false)
      .order("created_at", { ascending: false })
      .limit(2)

    if (nonTerminatedError) {
      return NextResponse.json({ error: nonTerminatedError.message }, { status: 500 })
    }

    const nonTerminated = nonTerminatedData || []
    let eventsRaw = [...nonTerminated]

    if (eventsRaw.length < 2) {
      const missing = 2 - eventsRaw.length
      const { data: terminatedData, error: terminatedError } = await supabase
        .from("evenements")
        .select("id, titre, date, heure, lieu, archive, created_at")
        .eq("archive", true)
        .order("created_at", { ascending: false })
        .limit(missing)

      if (terminatedError) {
        return NextResponse.json({ error: terminatedError.message }, { status: 500 })
      }

      eventsRaw = [...eventsRaw, ...(terminatedData || [])]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: HomeEvent[] = eventsRaw.slice(0, 2).map((event: any) => ({
      id: event.id,
      title: event.titre,
      date: formatDate(event.date),
      time: event.heure || "—",
      place: event.lieu || "—",
    }))

    return NextResponse.json({ articles, events })
  } catch (error) {
    console.error("Erreur home highlights:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

