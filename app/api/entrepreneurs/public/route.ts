import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const revalidate = 120

type EntreprisePublique = {
  id: string
  denomination_sociale: string
  nom_commercial: string | null
  secteur_activite: string
  description_produits: string
  stade_developpement: string
  effectif: string
  localisation_siege: string
  site_web: string | null
  logo_url: string | null
  presentation_publication: string | null
  impact_principal: string[]
  description_impact: string | null
  photos_urls: string[]
  created_at: string
  users: { nom: string | null; prenom: string | null } | null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin()

    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') || ''
    const secteur = searchParams.get('secteur') || ''
    const stade = searchParams.get('stade') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 6
    const offset = (page - 1) * limit

    let query = supabase
      .from('entreprises_alumni')
      .select(`
        id,
        denomination_sociale,
        nom_commercial,
        secteur_activite,
        description_produits,
        stade_developpement,
        effectif,
        localisation_siege,
        site_web,
        logo_url,
        presentation_publication,
        impact_principal,
        description_impact,
        photos_urls,
        created_at,
        users(nom, prenom)
      `, { count: 'exact' })
      .eq('statut', 'valide')

    if (search) query = query.ilike('denomination_sociale', `%${search}%`)
    if (secteur) query = query.eq('secteur_activite', secteur)
    if (stade) query = query.eq('stade_developpement', stade)

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      entreprises: (data as unknown as EntreprisePublique[]) || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
