import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

const PREVIEW_LIMIT = 6

type PreviewProfile = {
  id: string
  user_id: string
  nom: string
  prenom: string
  photo_url: string | null
  ville: string
  universite: string
  annee_promotion: number
  formation_domaine: string
  entreprise: string | null
  poste_actuel: string | null
  bio: string | null
  secteurs?: { libelle: string } | null
  statuts_professionnels?: { libelle: string } | null
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    const { data: profilesData, error: profilesError } = await supabase
      .from("alumni_profiles")
      .select(`
        id,
        user_id,
        nom,
        prenom,
        photo_url,
        ville,
        universite,
        annee_promotion,
        formation_domaine,
        entreprise,
        poste_actuel,
        bio,
        secteurs(libelle),
        statuts_professionnels(libelle)
      `)
      .eq("visible_annuaire", true)

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    const profiles = (profilesData as PreviewProfile[]) || []
    if (profiles.length === 0) {
      return NextResponse.json({ profiles: [] })
    }

    const userIds = [...new Set(profiles.map((p) => p.user_id))]
    const { data: activeUsersData, error: usersError } = await supabase
      .from("users")
      .select("id")
      .in("id", userIds)
      .eq("status", "actif")

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const activeIds = new Set((activeUsersData || []).map((u) => u.id))
    const activeProfiles = profiles.filter((p) => activeIds.has(p.user_id))
    const preview = shuffle(activeProfiles).slice(0, PREVIEW_LIMIT)

    return NextResponse.json({ profiles: preview })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
