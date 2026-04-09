import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
