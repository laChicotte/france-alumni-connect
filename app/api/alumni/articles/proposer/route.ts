import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailSafe } from '@/lib/email/resend'
import { proposalStaffNotificationEmail } from '@/lib/email/templates'
import { checkRateLimit } from '@/lib/rate-limit'

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

function generateSlug(titre: string) {
  return titre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'alumni')
  if (rateLimitResponse) return rateLimitResponse

  try {
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

    const { data: userProfile } = await (supabaseAdmin
      .from('users')
      .select('email, nom, prenom, status')
      .eq('id', callerAuth.user.id)
      .single() as any) as { data: { email: string; nom: string | null; prenom: string | null; status: string } | null }

    if (!userProfile || userProfile.status !== 'actif') {
      return NextResponse.json({ error: 'Compte inactif ou introuvable' }, { status: 403 })
    }

    const body = await request.json()
    const { titre, extrait, contenu, image_couverture_url, categorie_id } = body

    if (!titre?.trim() || !contenu?.trim() || !image_couverture_url) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const { data: article, error: insertError } = await (supabaseAdmin
      .from('articles') as any)
      .insert({
        titre: titre.trim(),
        slug: generateSlug(titre),
        extrait: extrait?.trim() || null,
        contenu: contenu.trim(),
        image_couverture_url,
        categorie_id: categorie_id || null,
        auteur_id: callerAuth.user.id,
        status: 'en_attente',
      })
      .select('id')
      .single()

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    const { data: staff } = await (supabaseAdmin
      .from('users')
      .select('email')
      .in('role', ['admin', 'moderateur'])
      .eq('status', 'actif') as any) as { data: { email: string }[] | null }

    if (staff && staff.length > 0) {
      const tpl = proposalStaffNotificationEmail({
        auteurPrenom: userProfile.prenom,
        auteurNom: userProfile.nom,
        auteurEmail: userProfile.email,
        titre: titre.trim(),
        type: 'article',
      })
      const emails = staff.map(s => s.email)
      await sendEmailSafe('article-proposal-staff', { to: emails, ...tpl })
    }

    return NextResponse.json({ success: true, id: article?.id })
  } catch (err) {
    console.error('Erreur proposition article:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
