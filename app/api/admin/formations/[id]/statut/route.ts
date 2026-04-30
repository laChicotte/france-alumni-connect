import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailSafe } from '@/lib/email/resend'
import { formationProposalApprovedEmail, formationProposalRejectedEmail } from '@/lib/email/templates'

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formationId } = await params
    const token = getBearerToken(request)
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })

    const callerClient = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: callerAuth, error: authError } = await callerClient.auth.getUser(token)
    if (authError || !callerAuth.user) return NextResponse.json({ error: 'Session invalide' }, { status: 401 })

    const supabaseAdmin = createSupabaseAdmin()

    const { data: callerProfile } = await (supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', callerAuth.user.id)
      .single() as any) as { data: { role: string } | null }

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    if (!formationId) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

    const body = await request.json()
    const action = String(body?.action || '')
    if (action !== 'publiee' && action !== 'archivee') {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    const { data: formation } = await (supabaseAdmin
      .from('formations')
      .select('id, titre, statut, proposee_par')
      .eq('id', formationId)
      .single() as any) as { data: { id: string; titre: string; statut: string; proposee_par: string | null } | null }

    if (!formation) return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 })

    const wasEnAttente = formation.statut === 'en_attente'

    const updatePayload = action === 'publiee'
      ? { statut: 'publiee' }
      : { statut: 'archivee', actif: false }

    const { error: updateError } = await (supabaseAdmin
      .from('formations') as any)
      .update(updatePayload)
      .eq('id', formationId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    // Notifier l'alumni uniquement si la formation était en attente
    if (wasEnAttente && formation.proposee_par) {
      const { data: proposant } = await (supabaseAdmin
        .from('users')
        .select('email, nom, prenom')
        .eq('id', formation.proposee_par)
        .single() as any) as { data: { email: string; nom: string | null; prenom: string | null } | null }

      if (proposant) {
        const tpl = action === 'publiee'
          ? formationProposalApprovedEmail({ email: proposant.email, nom: proposant.nom, prenom: proposant.prenom, titre: formation.titre })
          : formationProposalRejectedEmail({ email: proposant.email, nom: proposant.nom, prenom: proposant.prenom, titre: formation.titre })
        await sendEmailSafe(`formation-proposal-${action}`, { to: proposant.email, ...tpl })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur mise à jour statut formation:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
