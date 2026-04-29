import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 })
    }

    const callerClient = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: callerAuth, error: callerError } = await callerClient.auth.getUser(token)
    if (callerError || !callerAuth.user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    const supabaseAdmin = createSupabaseAdmin()
    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', callerAuth.user.id)
      .single()

    if (!callerProfile || !['admin', 'moderateur'].includes(callerProfile.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 10
    const offset = (page - 1) * limit
    const statut = searchParams.get('statut') || ''
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('entreprises_alumni')
      .select(`*, users(id, nom, prenom, email)`, { count: 'exact' })

    if (statut) query = query.eq('statut', statut)
    if (search) query = query.ilike('denomination_sociale', `%${search}%`)

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      entreprises: data || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch (err) {
    console.error('Erreur liste entreprises admin:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
