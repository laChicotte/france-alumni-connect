import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getEmailConfig, sendEmailSafe } from '@/lib/email/resend'
import { adminRegistrationNotificationEmail, registrationReceivedEmail } from '@/lib/email/templates'
import type { Database, DiplomeType, GenreType, NationaliteType, PlanRetourType, BourseType } from '@/types/database.types'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

// Rate limiting : max 5 tentatives par IP par fenêtre de 60s
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_PHOTO_SIZE = 3 * 1024 * 1024 // 3MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_GENRES: GenreType[] = ['Homme', 'Femme', 'Autre']
const ALLOWED_NATIONALITES: NationaliteType[] = ['Guinéenne', 'Franco-Guinéenne', 'Guinéenne-Autre']
const ALLOWED_PLAN_RETOUR: PlanRetourType[] = ['Dans 2 ans', 'Dans 5 ans', 'Déjà en Guinée', 'Autre']
const ALLOWED_BOURSES: BourseType[] = ['Non boursier', 'Boursier Etat français', 'Boursier Etat guinéen', 'Boursier Etats français et guinéen']
const ALLOWED_DIPLOMES: DiplomeType[] = [
  'bts',
  'dut',
  'du',
  'de',
  'deug',
  'prepa',
  'ecole_ingenieur',
  'ecole_specialisee',
  'licence_pro',
  'licence',
  'master1',
  'master2',
  'doctorat',
  'post_doctorat',
  'autre',
]

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Veuillez réessayer dans une minute.' },
      { status: 429 }
    )
  }

  try {
    const formData = await request.formData()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const prenom = formData.get('prenom') as string
    const nom = formData.get('nom') as string
    const genre = formData.get('genre') as string
    const nationalite = formData.get('nationalite') as string
    const telephone = formData.get('telephone') as string
    const ville = formData.get('ville') as string
    const universite = formData.get('universite') as string
    const anneePromotion = formData.get('annee_promotion') as string
    const diplome = formData.get('diplome') as string
    const formationDomaine = formData.get('formation_domaine') as string
    const statutProfessionnelId = formData.get('statut_professionnel_id') as string
    const secteurId = formData.get('secteur_id') as string
    const entreprise = formData.get('entreprise') as string
    const posteActuel = formData.get('poste_actuel') as string
    const bio = formData.get('bio') as string | null
    const linkedinUrlRaw = formData.get('linkedin_url') as string | null
    const linkedinUrl = linkedinUrlRaw?.trim() || null
    const planRetour = formData.get('plan_retour') as string
    const bourse = formData.get('bourse') as string
    const visibleAnnuaireRaw = formData.get('visible_annuaire') as string
    const diplomeFile = formData.get('diplome_file') as File | null
    const photoFile = formData.get('photo') as File | null

    if (
      !email ||
      !password ||
      !prenom ||
      !nom ||
      !genre ||
      !nationalite ||
      !telephone ||
      !ville ||
      !universite ||
      !anneePromotion ||
      !diplome ||
      !formationDomaine ||
      !statutProfessionnelId ||
      !secteurId ||
      !entreprise ||
      !posteActuel ||
      !planRetour ||
      !bourse ||
      !diplomeFile?.size ||
      !photoFile?.size
    ) {
      return NextResponse.json(
        { error: 'Veuillez renseigner tous les champs obligatoires.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_GENRES.includes(genre as GenreType)) {
      return NextResponse.json(
        { error: 'Genre invalide. Valeurs autorisées: Homme, Femme, Autre.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_NATIONALITES.includes(nationalite as NationaliteType)) {
      return NextResponse.json(
        { error: 'Nationalité invalide. Valeurs autorisées: Guinéenne, Franco-Guinéenne, Guinéenne-Autre.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_PLAN_RETOUR.includes(planRetour as PlanRetourType)) {
      return NextResponse.json({ error: 'Plan de retour invalide.' }, { status: 400 })
    }

    if (!ALLOWED_BOURSES.includes(bourse as BourseType)) {
      return NextResponse.json({ error: 'Type de bourse invalide.' }, { status: 400 })
    }

    if (!ALLOWED_DIPLOMES.includes(diplome as DiplomeType)) {
      return NextResponse.json({ error: 'Niveau de diplôme invalide.' }, { status: 400 })
    }

    const parsedPhone = parsePhoneNumberFromString(telephone)
    if (!parsedPhone || !parsedPhone.isValid()) {
      return NextResponse.json(
        { error: "Numéro de téléphone invalide (format international attendu)." },
        { status: 400 }
      )
    }

    const visibleAnnuaire = visibleAnnuaireRaw === 'true'
    if (!visibleAnnuaire) {
      return NextResponse.json(
        { error: 'Vous devez accepter la publication de votre profil dans l’annuaire.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    if (diplomeFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 5MB)' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(diplomeFile.type)) {
      return NextResponse.json(
        { error: 'Format de fichier non autorisé (PDF, JPG, PNG uniquement)' },
        { status: 400 }
      )
    }

    if (photoFile.size > MAX_PHOTO_SIZE) {
      return NextResponse.json(
        { error: 'La photo est trop volumineuse (max 3MB)' },
        { status: 400 }
      )
    }

    if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
      return NextResponse.json(
        { error: 'Format photo non autorisé (JPG, PNG, WEBP uniquement)' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const annee = parseInt(anneePromotion, 10) || new Date().getFullYear()

    // 1. Créer l'utilisateur dans auth.users (avec email confirmé pour éviter blocage)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'alumni',
        prenom,
        nom,
        genre,
        nationalite,
        telephone,
        ville,
        universite,
        annee_promotion: annee,
      },
    })

    if (authError) {
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Un compte existe déjà avec cette adresse email' },
          { status: 409 }
        )
      }
      if (authError.message.includes('rate limit') || authError.message.includes('429')) {
        return NextResponse.json(
          { error: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.' },
          { status: 429 }
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

    // 2. Insert dans users
    const userToInsert: Database['public']['Tables']['users']['Insert'] = {
      id: userId,
      email,
      nom,
      prenom,
      role: 'alumni',
      status: 'en_attente',
    }

    // Supabase type inference can resolve to never in API routes; cast keeps strict payload typing.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: userError } = await (supabase.from('users') as any).insert(userToInsert)

    if (userError) {
      console.error('Erreur insert users:', userError)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    // 3. Upload du diplôme
    const fileExt = diplomeFile.name.split('.').pop()?.toLowerCase() || 'pdf'
    const fileName = `${userId}/diplome_${Date.now()}.${fileExt}`
    const arrayBuffer = await diplomeFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('diplomes')
      .upload(fileName, buffer, {
        contentType: diplomeFile.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Erreur upload diplôme:', uploadError)
      await supabase.from('users').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload du diplôme. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage.from('diplomes').getPublicUrl(fileName)
    const diplomeUrl = urlData.publicUrl

    // 4. Upload photo de profil (obligatoire)
    const photoExt = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const photoPath = `${userId}/photo_${Date.now()}.${photoExt}`
    const photoArrayBuffer = await photoFile.arrayBuffer()
    const photoBuffer = Buffer.from(photoArrayBuffer)

    const { error: photoUploadError } = await supabase.storage
      .from('alumni-photos')
      .upload(photoPath, photoBuffer, {
        contentType: photoFile.type,
        upsert: true,
      })

    if (photoUploadError) {
      console.error('Erreur upload photo profil:', photoUploadError)
      await supabase.storage.from('diplomes').remove([fileName])
      await supabase.from('users').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload de la photo de profil. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    const { data: photoUrlData } = supabase.storage.from('alumni-photos').getPublicUrl(photoPath)
    const photoUrl = photoUrlData.publicUrl

    // 5. Insert dans alumni_profiles
    const profileToInsert: Database['public']['Tables']['alumni_profiles']['Insert'] = {
      user_id: userId,
      nom,
      prenom,
      genre: genre as GenreType,
      nationalite: nationalite as NationaliteType,
      telephone,
      ville,
      universite,
      annee_promotion: annee,
      diplome: diplome as DiplomeType,
      formation_domaine: formationDomaine,
      statut_professionnel_id: statutProfessionnelId,
      secteur_id: secteurId,
      entreprise,
      poste_actuel: posteActuel,
      bio: bio?.trim() || null,
      linkedin_url: linkedinUrl,
      visible_annuaire: visibleAnnuaire,
      document_diplome_url: diplomeUrl,
      photo_url: photoUrl,
      plan_retour: planRetour,
      bourse: bourse as BourseType,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase.from('alumni_profiles') as any).insert(profileToInsert)

    if (profileError) {
      console.error('Erreur insert alumni_profiles:', profileError)
      await supabase.storage.from('diplomes').remove([fileName])
      await supabase.storage.from('alumni-photos').remove([photoPath])
      await supabase.from('users').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement du profil. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    const { adminTo } = getEmailConfig()
    const userEmail = registrationReceivedEmail({ prenom, nom, email })
    const adminEmail = adminRegistrationNotificationEmail({ prenom, nom, email })

    const [userEmailResult, adminEmailResult] = await Promise.all([
      sendEmailSafe('inscription:user', {
        to: email,
        subject: userEmail.subject,
        html: userEmail.html,
        text: userEmail.text,
      }),
      sendEmailSafe('inscription:admin', {
        to: adminTo,
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
      }),
    ])

    return NextResponse.json({
      success: true,
      email: {
        user: userEmailResult.ok,
        admin: adminEmailResult.ok,
      },
    })
  } catch (err) {
    console.error('Erreur inscription:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
