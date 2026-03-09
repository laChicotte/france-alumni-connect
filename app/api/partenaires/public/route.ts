import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export const revalidate = 300 // 5 minutes

type PublicPartner = {
  name: string
  logo: string
  site_web: string | null
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data, error } = await supabase
      .from("partenaires")
      .select("nom, logo_url, site_web")
      .eq("actif", true)
      .order("ordre", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partners: PublicPartner[] = (data || []).map((item: any) => ({
      name: item.nom,
      logo: item.logo_url || "/placeholder.svg",
      site_web: item.site_web || null,
    }))

    return NextResponse.json({ partners })
  } catch (error) {
    console.error("Erreur API partenaires publics:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

