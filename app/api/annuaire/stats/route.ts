import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export const revalidate = 120 // 2 minutes

type StatsProfile = {
  user_id: string
  ville: string | null
  photo_url: string | null
  genre: "Homme" | "Femme" | "Autre" | null
  secteurs?: { libelle: string } | null
  statuts_professionnels?: { libelle: string } | null
}

type ChartItem = { name: string; value: number }

function toSortedChartData(counter: Record<string, number>, limit?: number): ChartItem[] {
  const values = Object.entries(counter)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return typeof limit === "number" ? values.slice(0, limit) : values
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    // Requête unique : jointure !inner sur users filtre directement les alumni actifs
    const { data: profilesData, error: profilesError } = await supabase
      .from("alumni_profiles")
      .select(`
        user_id,
        ville,
        photo_url,
        genre,
        secteurs(libelle),
        statuts_professionnels(libelle),
        users!inner(id)
      `)
      .eq("visible_annuaire", true)
      .eq("users.status", "actif")

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    const activeProfiles = (profilesData as unknown as StatsProfile[]) || []
    if (activeProfiles.length === 0) {
      return NextResponse.json({
        totalAlumni: 0,
        withPhoto: 0,
        cityCount: 0,
        genderData: [],
        sectorData: [],
        statusData: [],
      })
    }

    const totalAlumni = activeProfiles.length
    const withPhoto = activeProfiles.filter((p) => !!p.photo_url).length
    const cityCount = new Set(
      activeProfiles.map((p) => (p.ville || "").trim()).filter(Boolean)
    ).size

    const genderCounter: Record<string, number> = { Homme: 0, Femme: 0, Autre: 0 }
    const sectorCounter: Record<string, number> = {}
    const statusCounter: Record<string, number> = {}

    activeProfiles.forEach((profile) => {
      const genre = profile.genre || "Autre"
      genderCounter[genre] = (genderCounter[genre] || 0) + 1

      const secteur = profile.secteurs?.libelle || "Non renseigné"
      sectorCounter[secteur] = (sectorCounter[secteur] || 0) + 1

      const statut = profile.statuts_professionnels?.libelle || "Non renseigné"
      statusCounter[statut] = (statusCounter[statut] || 0) + 1
    })

    return NextResponse.json({
      totalAlumni,
      withPhoto,
      cityCount,
      genderData: toSortedChartData(genderCounter),
      sectorData: toSortedChartData(sectorCounter, 5),
      statusData: toSortedChartData(statusCounter, 6),
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

