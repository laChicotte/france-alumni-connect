import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailSafe } from '@/lib/email/resend'
import { proposalStaffNotificationEmail } from '@/lib/email/templates'

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

function generateSlug(titre: string) {
  return titre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
}

export async function POST(request: NextRequest) {
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
    const {
      titre, date_debut, date_fin, heure_debut, heure_fin,
      lieu, lien_visio, type_formation_id, description, programme,
      image_url, places_max, niveau, gratuit, prix,
    } = body

    if (!titre?.trim() || !date_debut || !heure_debut || !lieu?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const { error: insertError } = await (supabaseAdmin
      .from('formations') as any)
      .insert({
        titre: titre.trim(),
        slug: generateSlug(titre),
        date_debut,
        date_fin: date_fin || null,
        heure_debut,
        heure_fin: heure_fin || null,
        lieu: lieu.trim(),
        lien_visio: lien_visio?.trim() || null,
        type_formation_id: type_formation_id || null,
        description: description.trim(),
        programme: programme?.trim() || null,
        image_url: image_url || '',
        places_max: places_max ? parseInt(places_max) : null,
        niveau: niveau || null,
        gratuit: gratuit ?? true,
        prix: !gratuit && prix ? parseFloat(prix) : null,
        proposee_par: callerAuth.user.id,
        statut: 'en_attente',
        actif: true,
      })

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
        type: 'formation',
      })
      await sendEmailSafe('formation-proposal-staff', { to: staff.map(s => s.email), ...tpl })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur proposition formation:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
