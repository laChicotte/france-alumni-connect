import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = createSupabaseAdmin()

    const { data: article, error } = await supabase
      .from("articles")
      .select("id, titre, extrait, contenu, image_couverture_url, date_publication, created_at, auteur_id")
      .eq("id", id)
      .eq("status", "publie")
      .single()

    if (error || !article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
    }

    let author: { nom: string | null; prenom: string | null } | null = null
    if (article.auteur_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("nom, prenom")
        .eq("id", article.auteur_id)
        .single()

      author = userData || null
    }

    const { data: mediaData } = await supabase
      .from("article_media")
      .select("id, media_type, media_url, ordre")
      .eq("article_id", article.id)
      .order("ordre", { ascending: true })

    return NextResponse.json({ article, author, media: mediaData || [] })
  } catch (error) {
    console.error("Erreur API article public:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

