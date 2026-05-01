import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await checkRateLimit(request, 'alumni')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { id } = await context.params
    const supabase = createSupabaseAdmin()

    const { data: current } = await supabase
      .from("articles")
      .select("vues")
      .eq("id", id)
      .eq("status", "publie")
      .single() as { data: { vues: number } | null }

    if (!current) return NextResponse.json({ ok: false }, { status: 404 })

    await (supabase as any)
      .from("articles")
      .update({ vues: (current.vues || 0) + 1 })
      .eq("id", id)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
