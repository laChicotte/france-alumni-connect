import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

// URL signée valide 1 heure
const SIGNED_URL_EXPIRES_IN = 3600

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    const callerClient = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: callerAuth, error: authError } = await callerClient.auth.getUser(token)
    if (authError || !callerAuth.user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    const supabaseAdmin = createSupabaseAdmin()

    // Récupérer le chemin du diplôme depuis le profil de l'utilisateur
    const { data: profile } = await (supabaseAdmin
      .from('alumni_profiles')
      .select('document_diplome_url')
      .eq('user_id', callerAuth.user.id)
      .single() as any) as { data: { document_diplome_url: string | null } | null }

    if (!profile?.document_diplome_url) {
      return NextResponse.json({ error: 'Aucun diplôme trouvé' }, { status: 404 })
    }

    const diplomeValue = profile.document_diplome_url

    // Rétrocompatibilité : anciens enregistrements stockés comme URL publique complète
    // On extrait le chemin pour générer une URL signée (le bucket est maintenant privé)
    let storagePath = diplomeValue
    if (diplomeValue.startsWith('http')) {
      const marker = '/storage/v1/object/public/diplomes/'
      const idx = diplomeValue.indexOf(marker)
      if (idx === -1) {
        return NextResponse.json({ error: 'Chemin de diplôme invalide' }, { status: 400 })
      }
      storagePath = diplomeValue.slice(idx + marker.length)
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from('diplomes')
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRES_IN)

    if (signError || !signed?.signedUrl) {
      return NextResponse.json({ error: 'Impossible de générer le lien' }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: signed.signedUrl })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
