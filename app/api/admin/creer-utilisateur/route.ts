import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import type { UserRole } from '@/types/database.types'

const ALLOWED_ROLES: UserRole[] = ['admin', 'moderateur']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nom, prenom, role } = body

    // Validation
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

    const supabase = createSupabaseAdmin()

    // 1. Créer l'utilisateur dans auth.users (email confirmé, pas besoin de vérification)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nom,
        prenom,
        role,
      },
    })

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Un compte existe déjà avec cette adresse email' },
          { status: 409 }
        )
      }
      console.error('Erreur auth admin:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // 2. Insérer dans public.users avec le bon rôle et statut actif
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: userError } = await (supabase.from('users') as any).insert({
      id: userId,
      email,
      nom,
      prenom,
      role: role as UserRole,
      status: 'actif',
    })

    if (userError) {
      console.error('Erreur insert users:', userError)
      // Rollback : supprimer le user auth créé
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du profil. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur création utilisateur admin:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
