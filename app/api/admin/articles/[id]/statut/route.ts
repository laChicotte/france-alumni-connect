import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { sendEmailSafe } from '@/lib/email/resend'
import { articleProposalApprovedEmail, articleProposalRejectedEmail } from '@/lib/email/templates'

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
    const { id: articleId } = await params
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

    if (!articleId) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    const body = await request.json()
    const action = String(body?.action || '')

    if (action !== 'publie' && action !== 'rejete') {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    const { data: article, error: articleError } = await (supabaseAdmin
      .from('articles')
      .select('id, titre, auteur_id')
      .eq('id', articleId)
      .single() as any) as { data: { id: string; titre: string; auteur_id: string | null } | null; error: any }

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    }

    let authorEmail: string | null = null
    let authorNom: string | null = null
    let authorPrenom: string | null = null

    if (article.auteur_id) {
      const { data: author } = await (supabaseAdmin
        .from('users')
        .select('email, nom, prenom')
        .eq('id', article.auteur_id)
        .single() as any) as { data: { email: string; nom: string | null; prenom: string | null } | null }

      if (author) {
        authorEmail = author.email
        authorNom = author.nom
        authorPrenom = author.prenom
      }
    }

    if (action === 'publie') {
      const { error: updateError } = await (supabaseAdmin
        .from('articles') as any)
        .update({ status: 'publie', date_publication: new Date().toISOString() })
        .eq('id', articleId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      if (authorEmail) {
        const tpl = articleProposalApprovedEmail({ email: authorEmail, nom: authorNom, prenom: authorPrenom, titre: article.titre })
        await sendEmailSafe('article-proposal-approved', { to: authorEmail, ...tpl })
      }
    } else {
      if (authorEmail) {
        const tpl = articleProposalRejectedEmail({ email: authorEmail, nom: authorNom, prenom: authorPrenom, titre: article.titre })
        await sendEmailSafe('article-proposal-rejected', { to: authorEmail, ...tpl })
      }

      const { error: deleteError } = await (supabaseAdmin
        .from('articles') as any)
        .delete()
        .eq('id', articleId)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur mise à jour statut article:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
