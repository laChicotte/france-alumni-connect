import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"
import { checkRateLimit } from "@/lib/rate-limit"

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get("authorization") || ""
  if (!auth.toLowerCase().startsWith("bearer ")) return null
  return auth.slice(7).trim()
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'alumni')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const token = getBearerToken(request)
    const body = await request.json()
    const { formation_id } = body || {}
    if (!formation_id) {
      return NextResponse.json({ error: "formation_id est requis" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const userClient = createClient<Database>(url, anon, {
      global: {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Mode interne: utilisateur connecté
    if (token) {
      const { data: userData, error: userError } = await userClient.auth.getUser(token)
      if (userError || !userData.user) {
        return NextResponse.json({ error: "Session invalide" }, { status: 401 })
      }

      const userId = userData.user.id

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (userClient.from("inscriptions_formations") as any).insert({
        formation_id,
        user_id: userId,
      })

      if (insertError) {
        if ((insertError as any).code === "23505") {
          return NextResponse.json({ error: "Vous êtes déjà inscrit à cette formation" }, { status: 409 })
        }
        if ((insertError.message || "").toLowerCase().includes("complète")) {
          return NextResponse.json({ error: "Cette formation est complète" }, { status: 409 })
        }
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, mode: "interne" })
    }

    // Mode externe: sans compte
    const nom_externe = (body?.nom_externe || "").toString().trim()
    const prenom_externe = (body?.prenom_externe || "").toString().trim()
    const email_externe = (body?.email_externe || "").toString().trim().toLowerCase()
    const telephone_externe = (body?.telephone_externe || "").toString().trim() || null
    const organisation_externe = (body?.organisation_externe || "").toString().trim() || null

    if (!nom_externe || !prenom_externe || !email_externe) {
      return NextResponse.json(
        { error: "Nom, prénom et email sont requis pour une inscription externe" },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email_externe)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (userClient.from("inscriptions_formations") as any).insert({
      formation_id,
      user_id: null,
      nom_externe,
      prenom_externe,
      email_externe,
      telephone_externe,
      organisation_externe,
    })

    if (insertError) {
      if ((insertError as any).code === "23505") {
        return NextResponse.json({ error: "Cet email est déjà inscrit à cette formation" }, { status: 409 })
      }
      if ((insertError.message || "").toLowerCase().includes("complète")) {
        return NextResponse.json({ error: "Cette formation est complète" }, { status: 409 })
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, mode: "externe" })
  } catch (error) {
    console.error("Erreur inscription formation:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
