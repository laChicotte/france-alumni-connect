import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const [secteursRes, statutsRes] = await Promise.all([
      supabase.from("secteurs").select("id, libelle").order("ordre"),
      supabase.from("statuts_professionnels").select("id, libelle").order("ordre"),
    ])

    if (secteursRes.error) {
      return NextResponse.json({ error: secteursRes.error.message }, { status: 500 })
    }
    if (statutsRes.error) {
      return NextResponse.json({ error: statutsRes.error.message }, { status: 500 })
    }

    return NextResponse.json({
      secteurs: secteursRes.data || [],
      statuts_professionnels: statutsRes.data || [],
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
