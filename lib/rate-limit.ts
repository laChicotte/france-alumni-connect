import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

function isUpstashConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

// Limite généreuse pour les inscriptions publiques (5 tentatives / minute par IP)
let inscriptionLimiter: Ratelimit | null = null

// Limite pour les routes alumni authentifiées (20 requêtes / minute par user)
let alumniLimiter: Ratelimit | null = null

// Limite pour les routes admin (30 requêtes / minute par user)
let adminLimiter: Ratelimit | null = null

function getInscriptionLimiter() {
  if (!inscriptionLimiter && isUpstashConfigured()) {
    inscriptionLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'rl:inscription',
    })
  }
  return inscriptionLimiter
}

function getAlumniLimiter() {
  if (!alumniLimiter && isUpstashConfigured()) {
    alumniLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      prefix: 'rl:alumni',
    })
  }
  return alumniLimiter
}

function getAdminLimiter() {
  if (!adminLimiter && isUpstashConfigured()) {
    adminLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, '60 s'),
      prefix: 'rl:admin',
    })
  }
  return adminLimiter
}

function getIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

type LimiterType = 'inscription' | 'alumni' | 'admin'

export async function checkRateLimit(
  request: NextRequest,
  type: LimiterType = 'alumni',
  identifier?: string
): Promise<NextResponse | null> {
  const limiter =
    type === 'inscription' ? getInscriptionLimiter()
    : type === 'admin' ? getAdminLimiter()
    : getAlumniLimiter()

  // Si Upstash n'est pas configuré, on laisse passer (mode développement)
  if (!limiter) return null

  const key = identifier || getIp(request)
  const { success } = await limiter.limit(key)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Veuillez réessayer dans une minute.' },
      { status: 429 }
    )
  }

  return null
}
