import { NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type StatsProfile = {
  user_id: string
  ville: string | null
  photo_url: string | null
  genre: "Homme" | "Femme" | "Autre" | null
  plan_retour: "Dans 2 ans" | "Dans 5 ans" | "Déjà en Guinée" | "Autre" | null
  secteurs?: { libelle: string } | null
  statuts_professionnels?: { libelle: string } | null
}

type ChartItem = { name: string; value: number }

function normalizeLabel(value: string | null | undefined): string {
  if (!value) return ""
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function toSortedChartData(counter: Record<string, number>, limit?: number): ChartItem[] {
  const values = Object.entries(counter)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return typeof limit === "number" ? values.slice(0, limit) : values
}

export async function GET() {
  try {
    const supabase = createSupabaseAdmin()

    // Stats publiques : uniquement les profils visibles dans l'annuaire
    const { data: profilesData, error: profilesError } = await supabase
      .from("alumni_profiles")
      .select(`
        user_id,
        ville,
        photo_url,
        genre,
        plan_retour,
        secteurs(libelle),
        statuts_professionnels(libelle)
      `)
      .eq("visible_annuaire", true)

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    const activeProfiles = (profilesData as unknown as StatsProfile[]) || []
    if (activeProfiles.length === 0) {
      return NextResponse.json({
        totalAlumni: 0,
        withPhoto: 0,
        cityCount: 0,
        planRetourCount: 0,
        dejaEnGuineeCount: 0,
        professionalPercentages: { entrepreneurs: 0, salaries: 0, dirigeants: 0 },
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
    let entrepreneurCount = 0
    let salarieCount = 0
    let dirigeantCount = 0
    let planRetourCount = 0
    let dejaEnGuineeCount = 0

    activeProfiles.forEach((profile) => {
      const genre = profile.genre || "Autre"
      genderCounter[genre] = (genderCounter[genre] || 0) + 1

      const secteur = profile.secteurs?.libelle || "Non renseigné"
      sectorCounter[secteur] = (sectorCounter[secteur] || 0) + 1

      const statut = profile.statuts_professionnels?.libelle || "Non renseigné"
      statusCounter[statut] = (statusCounter[statut] || 0) + 1
      const normalizedStatut = normalizeLabel(statut)

      if (normalizedStatut.includes("entrepreneur")) {
        entrepreneurCount++
      }
      if (normalizedStatut === "salarie" || normalizedStatut.includes("salarie")) {
        salarieCount++
      }
      if (normalizedStatut.includes("dirigeant")) {
        dirigeantCount++
      }

      const normalizedPlanRetour = normalizeLabel(profile.plan_retour)
      if (normalizedPlanRetour === "dans 2 ans" || normalizedPlanRetour === "dans 5 ans") {
        planRetourCount++
      }
      if (normalizedPlanRetour === "deja en guinee") {
        dejaEnGuineeCount++
      }
    })

    return NextResponse.json({
      totalAlumni,
      withPhoto,
      cityCount,
      planRetourCount,
      dejaEnGuineeCount,
      professionalPercentages: {
        entrepreneurs: totalAlumni > 0 ? Math.round((entrepreneurCount / totalAlumni) * 100) : 0,
        salaries: totalAlumni > 0 ? Math.round((salarieCount / totalAlumni) * 100) : 0,
        dirigeants: totalAlumni > 0 ? Math.round((dirigeantCount / totalAlumni) * 100) : 0,
      },
      genderData: toSortedChartData(genderCounter),
      sectorData: toSortedChartData(sectorCounter, 5),
      statusData: toSortedChartData(statusCounter, 6),
    })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

