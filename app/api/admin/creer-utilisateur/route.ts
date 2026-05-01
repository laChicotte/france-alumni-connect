import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailSafe } from '@/lib/email/resend'
import { adminUserCreatedEmail } from '@/lib/email/templates'
import type { UserRole } from '@/types/database.types'
import { checkRateLimit } from '@/lib/rate-limit'

const ALLOWED_ROLES: UserRole[] = ['admin', 'moderateur']

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'admin')
  if (rateLimitResponse) return rateLimitResponse

  try {
    // 1. Vérifier l'authentification de l'appelant
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 })
    }

    // Vérifier le token et récupérer l'utilisateur appelant
    const callerClient = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: callerAuth, error: callerError } = await callerClient.auth.getUser(token)
    if (callerError || !callerAuth.user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    // 2. Vérifier que l'appelant est bien admin
    const supabaseAdmin = createSupabaseAdmin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: callerProfile } = await (supabaseAdmin.from('users') as any)
      .select('role')
      .eq('id', callerAuth.user.id)
      .single()

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé. Seuls les admins peuvent créer des comptes.' }, { status: 403 })
    }

    // 3. Valider le body
    const body = await request.json()
    const { email, password, nom, prenom, role } = body

    if (!email || !password || !nom || !prenom || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    if (!ALLOWED_ROLES.includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Rôle invalide. Valeurs autorisées: admin, moderateur' },
        { status: 400 }
      )
    }

    // 4. Créer l'utilisateur dans auth.users (email confirmé, pas besoin de vérification)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nom, prenom, role },
    })

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Un compte existe déjà avec cette adresse email' },
          { status: 409 }
        )
      }
      console.error('Erreur auth admin:', authError)
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
    }

    const userId = authData.user.id

    // 5. Insérer dans public.users avec le bon rôle et statut actif
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: userError } = await (supabaseAdmin.from('users') as any).insert({
      id: userId,
      email,
      nom,
      prenom,
      role: role as UserRole,
      status: 'actif',
    })

    if (userError) {
      console.error('Erreur insert users:', userError)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du profil. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    const userCreatedEmail = adminUserCreatedEmail({ email, nom, prenom, role })
    await sendEmailSafe('admin:create-user', {
      to: email,
      subject: userCreatedEmail.subject,
      html: userCreatedEmail.html,
      text: userCreatedEmail.text,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur création utilisateur admin:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
