import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

function getBearerToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('bearer ')) return null
  return auth.slice(7).trim()
}

async function uploadFile(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  bucket: string,
  userId: string,
  file: File,
  prefix: string
): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${userId}/${prefix}-${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return null
  if (bucket === 'entreprises-docs') return path
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

async function deleteStorageFile(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  bucket: string,
  urlOrPath: string
) {
  try {
    let path = urlOrPath
    if (urlOrPath.startsWith('http')) {
      const marker = `/storage/v1/object/public/${bucket}/`
      const idx = urlOrPath.indexOf(marker)
      if (idx === -1) return
      path = urlOrPath.slice(idx + marker.length)
    }
    await supabase.storage.from(bucket).remove([path])
  } catch {}
}

const VALID_STADES = ['lancement', 'activite_reguliere', 'croissance', 'expansion']

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

    const userId = callerAuth.user.id
    const supabaseAdmin = createSupabaseAdmin()

    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('role, status')
      .eq('id', userId)
      .single()

    if (!userProfile || userProfile.role !== 'alumni' || userProfile.status !== 'actif') {
      return NextResponse.json({ error: 'Accès réservé aux alumni actifs' }, { status: 403 })
    }

    const formData = await request.formData()

    const get = (key: string) => String(formData.get(key) || '').trim()

    const fonction = get('fonction')
    const email_pro = get('email_pro')
    const telephone_pro = get('telephone_pro')
    const denomination_sociale = get('denomination_sociale')
    const forme_juridique = get('forme_juridique')
    const date_creation = get('date_creation')
    const numero_rccm_nif = get('numero_rccm_nif')
    const localisation_siege = get('localisation_siege')
    const secteur_activite = get('secteur_activite')
    const description_produits = get('description_produits')
    const stade_developpement = get('stade_developpement')
    const effectif = get('effectif')

    if (
      !fonction || !email_pro || !telephone_pro || !denomination_sociale ||
      !forme_juridique || !date_creation || !numero_rccm_nif || !localisation_siege ||
      !secteur_activite || !description_produits || !stade_developpement || !effectif
    ) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    if (!VALID_STADES.includes(stade_developpement)) {
      return NextResponse.json({ error: 'Stade de développement invalide' }, { status: 400 })
    }

    const nom_commercial = get('nom_commercial') || null
    const chiffre_affaires = get('chiffre_affaires') || null
    const site_web = get('site_web') || null
    const besoins_autre = get('besoins_autre') || null
    const domaine_associe = get('domaine_associe') || null
    const description_impact = get('description_impact') || null
    const presentation_publication = get('presentation_publication') || null

    const parseJsonArray = (key: string): string[] => {
      try { return JSON.parse(String(formData.get(key) || '[]')) } catch { return [] }
    }
    const types_clients = parseJsonArray('types_clients')
    const besoins = parseJsonArray('besoins')
    const impact_principal = parseJsonArray('impact_principal')

    const parseBool = (key: string) => formData.get(key) === 'true'
    const recherche_associe = parseBool('recherche_associe')
    const propose_emploi = parseBool('propose_emploi')
    const disponible_evenement = parseBool('disponible_evenement')
    const souhaite_mentor = parseBool('souhaite_mentor')
    const mise_en_avant = parseBool('mise_en_avant')

    const { data: existing } = await supabaseAdmin
      .from('entreprises_alumni')
      .select('id, logo_url, document_justificatif_url, photos_urls')
      .eq('user_id', userId)
      .maybeSingle()

    // Logo
    let logo_url: string | null = existing?.logo_url ?? null
    const logoFile = formData.get('logo') as File | null
    if (logoFile && logoFile.size > 0) {
      if (existing?.logo_url) {
        await deleteStorageFile(supabaseAdmin, 'entreprises-logos', existing.logo_url)
      }
      logo_url = await uploadFile(supabaseAdmin, 'entreprises-logos', userId, logoFile, 'logo')
    }

    // Document justificatif (private — stocke le path)
    let document_justificatif_url: string | null = existing?.document_justificatif_url ?? null
    const docFile = formData.get('document_justificatif') as File | null
    if (docFile && docFile.size > 0) {
      if (existing?.document_justificatif_url) {
        await supabaseAdmin.storage
          .from('entreprises-docs')
          .remove([existing.document_justificatif_url])
      }
      document_justificatif_url = await uploadFile(
        supabaseAdmin, 'entreprises-docs', userId, docFile, 'document'
      )
    }

    // Photos
    let photos_urls: string[] = existing?.photos_urls ?? []
    const photoFiles = (formData.getAll('photos') as File[]).filter(f => f.size > 0)
    if (photoFiles.length > 0) {
      for (const oldUrl of (existing?.photos_urls ?? [])) {
        await deleteStorageFile(supabaseAdmin, 'entreprises-media', oldUrl)
      }
      const uploaded = await Promise.all(
        photoFiles.map((f, i) => uploadFile(supabaseAdmin, 'entreprises-media', userId, f, `photo-${i}`))
      )
      photos_urls = uploaded.filter(Boolean) as string[]
    }

    const payload = {
      user_id: userId,
      statut: 'en_attente' as const,
      fonction, email_pro, telephone_pro,
      denomination_sociale, nom_commercial, forme_juridique, date_creation,
      numero_rccm_nif, localisation_siege, document_justificatif_url,
      secteur_activite, description_produits, stade_developpement, effectif,
      chiffre_affaires, types_clients, site_web,
      besoins, besoins_autre,
      recherche_associe, domaine_associe, propose_emploi, disponible_evenement, souhaite_mentor,
      impact_principal, description_impact, mise_en_avant, presentation_publication,
      logo_url, photos_urls,
    }

    if (existing) {
      const { error } = await supabaseAdmin
        .from('entreprises_alumni')
        .update(payload)
        .eq('user_id', userId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabaseAdmin
        .from('entreprises_alumni')
        .insert(payload)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur soumission entreprise:', err)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
