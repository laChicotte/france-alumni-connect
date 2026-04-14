import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export const revalidate = 300 // 5 minutes

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

    // Requête unique : auteur + médias chargés via jointures
    const { data: articleRaw, error } = await supabase
      .from("articles")
      .select(`
        id, titre, extrait, contenu, image_couverture_url, date_publication, created_at, auteur_nom,
        users(nom, prenom),
        article_media(id, media_type, media_url, ordre)
      `)
      .eq("id", id)
      .eq("status", "publie")
      .single()

    if (!error && articleRaw) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = articleRaw as any
      const article = {
        id: raw.id,
        titre: raw.titre,
        extrait: raw.extrait,
        contenu: raw.contenu,
        image_couverture_url: raw.image_couverture_url,
        date_publication: raw.date_publication,
        created_at: raw.created_at,
      }
      const author = {
        nom: raw.users?.nom ?? null,
        prenom: raw.users?.prenom ?? null,
        auteur_nom: raw.auteur_nom ?? null,
      }
      const media = Array.isArray(raw.article_media)
        ? [...raw.article_media].sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre)
        : []

      return NextResponse.json({ article, author, media })
    }

    // Fallback: id peut correspondre à un événement dans le flux fusionné des actualités.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: eventRaw } = await (supabase as any)
      .from("evenements")
      .select("id, titre, description, image_url, date, heure, lieu, created_at")
      .eq("id", id)
      .single()

    if (!eventRaw) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
    }

    const ev = eventRaw as {
      id: string; titre: string; description: string | null
      image_url: string | null; date: string | null; heure: string | null
      lieu: string | null; created_at: string
    }

    const eventAsArticle = {
      id: ev.id,
      titre: ev.titre,
      extrait: ev.description || "",
      contenu: `
        <p>${escapeHtml(ev.description || "")}</p>
        <h3>Détails de l'événement</h3>
        <ul>
          <li><strong>Date:</strong> ${escapeHtml(ev.date || "—")}</li>
          <li><strong>Heure:</strong> ${escapeHtml(ev.heure || "—")}</li>
          <li><strong>Lieu:</strong> ${escapeHtml(ev.lieu || "—")}</li>
        </ul>
      `,
      image_couverture_url: ev.image_url || "/placeholder.svg",
      date_publication: ev.created_at,
      created_at: ev.created_at,
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

