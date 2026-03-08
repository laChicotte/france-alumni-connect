import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get("authorization") || ""
  if (!auth.toLowerCase().startsWith("bearer ")) return null
  return auth.slice(7).trim()
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { evenement_id } = await request.json()
    if (!evenement_id) {
      return NextResponse.json({ error: "evenement_id est requis" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    // Client lié à la session utilisateur -> RLS appliquée normalement
    const userClient = createClient<Database>(url, anon, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { data: userData, error: userError } = await userClient.auth.getUser(token)
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 })
    }

    const userId = userData.user.id

    // Vérifier que l'événement est encore ouvert
    const { data: event, error: eventError } = await userClient
      .from("evenements")
      .select("id, titre, actif, archive")
      .eq("id", evenement_id)
      .single()

    if (eventError || !event || !event.actif || event.archive) {
      return NextResponse.json({ error: "Événement indisponible" }, { status: 400 })
    }

    // Insertion inscription (doublon/capacité gérés par index+trigger en base)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (userClient.from("inscriptions_evenements") as any).insert({
      evenement_id,
      user_id: userId,
    })

    if (insertError) {
      if ((insertError as any).code === "23505") {
        return NextResponse.json({ error: "Vous êtes déjà inscrit à cet événement" }, { status: 409 })
      }
      if ((insertError.message || "").toLowerCase().includes("complet")) {
        return NextResponse.json({ error: "Cet événement est complet" }, { status: 409 })
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur inscription événement:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

