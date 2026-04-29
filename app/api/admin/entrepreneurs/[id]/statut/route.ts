import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

const ALLOWED_STATUTS = ['en_attente', 'valide', 'rejete'] as const
type EntrepriseStatutAction = typeof ALLOWED_STATUTS[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé. Seuls les admins peuvent valider/rejeter.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const statut = String(body?.statut || '') as EntrepriseStatutAction
    const notes_admin = body?.notes_admin !== undefined
      ? String(body.notes_admin).trim()
      : undefined

    if (!ALLOWED_STATUTS.includes(statut)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const entrepriseId = params.id
    if (!entrepriseId) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = { statut }
    if (notes_admin !== undefined) updatePayload.notes_admin = notes_admin

    const { error: updateError } = await supabaseAdmin
      .from('entreprises_alumni')
      .update(updatePayload)
      .eq('id', entrepriseId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur mise à jour statut entreprise:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
