import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailSafe } from '@/lib/email/resend'
import { accountStatusChangedEmail } from '@/lib/email/templates'

type ManagedUserStatus = 'actif' | 'banni'

const ALLOWED_STATUSES: ManagedUserStatus[] = ['actif', 'banni']

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const userId = String(body?.userId || '')
    const status = String(body?.status || '') as ManagedUserStatus

    if (!userId || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const supabaseAdmin = createSupabaseAdmin()
    const { data: callerProfile } = await (supabaseAdmin.from('users') as any)
      .select('role')
      .eq('id', callerAuth.user.id)
      .single()

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé. Seuls les admins peuvent modifier le statut.' }, { status: 403 })
    }

    const { data: targetUser, error: targetError } = await (supabaseAdmin.from('users') as any)
      .select('id, email, nom, prenom, status')
      .eq('id', userId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const { error: updateError } = await (supabaseAdmin.from('users') as any)
      .update({ status })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const statusEmail = accountStatusChangedEmail({
      prenom: targetUser.prenom,
      nom: targetUser.nom,
      status,
    })

    const emailResult = await sendEmailSafe('admin:user-status', {
      to: targetUser.email,
      subject: statusEmail.subject,
      html: statusEmail.html,
      text: statusEmail.text,
    })

    return NextResponse.json({
      success: true,
      emailSent: emailResult.ok,
      emailError: emailResult.ok ? null : emailResult.error,
    })
  } catch (err) {
    console.error('Erreur modification statut utilisateur:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
