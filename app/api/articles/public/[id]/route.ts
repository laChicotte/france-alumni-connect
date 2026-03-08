import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

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

    if (!error && article) {
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
    }

    // Fallback: id peut correspondre à un événement dans le flux fusionné des actualités.
    const { data: event } = await supabase
      .from("evenements")
      .select("id, titre, description, image_url, date, heure, lieu, created_at")
      .eq("id", id)
      .single()

    if (!event) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
    }

    const eventAsArticle = {
      id: event.id,
      titre: event.titre,
      extrait: event.description || "",
      contenu: `
        <p>${escapeHtml(event.description || "")}</p>
        <h3>Détails de l'événement</h3>
        <ul>
          <li><strong>Date:</strong> ${escapeHtml(event.date || "—")}</li>
          <li><strong>Heure:</strong> ${escapeHtml(event.heure || "—")}</li>
          <li><strong>Lieu:</strong> ${escapeHtml(event.lieu || "—")}</li>
        </ul>
      `,
      image_couverture_url: event.image_url || "/placeholder.svg",
      date_publication: event.created_at,
      created_at: event.created_at,
    }

    return NextResponse.json({
      article: eventAsArticle,
      author: { nom: "France Alumni", prenom: "Équipe" },
      media: [],
    })
  } catch (error) {
    console.error("Erreur API article public:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

