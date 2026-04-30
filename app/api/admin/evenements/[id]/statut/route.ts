import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailSafe } from '@/lib/email/resend'
import { evenementProposalApprovedEmail, evenementProposalRejectedEmail } from '@/lib/email/templates'

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
    const { id: evenementId } = await params
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
    const { data: callerProfile } = await (supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', callerAuth.user.id)
      .single() as any) as { data: { role: string } | null }

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    if (!evenementId) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    const body = await request.json()
    const action = String(body?.action || '')

    if (action !== 'publie' && action !== 'rejete') {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    const { data: evenement, error: evenementError } = await (supabaseAdmin
      .from('evenements')
      .select('id, titre, organisateur_id')
      .eq('id', evenementId)
      .single() as any) as { data: { id: string; titre: string; organisateur_id: string | null } | null; error: any }

    if (evenementError || !evenement) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    let organizerEmail: string | null = null
    let organizerNom: string | null = null
    let organizerPrenom: string | null = null

    if (evenement.organisateur_id) {
      const { data: organizer } = await (supabaseAdmin
        .from('users')
        .select('email, nom, prenom')
        .eq('id', evenement.organisateur_id)
        .single() as any) as { data: { email: string; nom: string | null; prenom: string | null } | null }

      if (organizer) {
        organizerEmail = organizer.email
        organizerNom = organizer.nom
        organizerPrenom = organizer.prenom
      }
    }

    if (action === 'publie') {
      const { error: updateError } = await (supabaseAdmin
        .from('evenements') as any)
        .update({ statut: 'publie', actif: true })
        .eq('id', evenementId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      if (organizerEmail) {
        const tpl = evenementProposalApprovedEmail({ email: organizerEmail, nom: organizerNom, prenom: organizerPrenom, titre: evenement.titre })
        await sendEmailSafe('evenement-proposal-approved', { to: organizerEmail, ...tpl })
      }
    } else {
      if (organizerEmail) {
        const tpl = evenementProposalRejectedEmail({ email: organizerEmail, nom: organizerNom, prenom: organizerPrenom, titre: evenement.titre })
        await sendEmailSafe('evenement-proposal-rejected', { to: organizerEmail, ...tpl })
      }

      const { error: updateError } = await (supabaseAdmin
        .from('evenements') as any)
        .update({ statut: 'rejete' })
        .eq('id', evenementId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur mise à jour statut événement:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
