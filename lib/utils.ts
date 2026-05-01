import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Valide qu'une URL est sûre (https:// ou http://) et bloque javascript:, data:, etc.
// Retourne l'URL nettoyée ou null si invalide/vide.
export function sanitizeUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    return trimmed
  } catch {
    return null
  }
}

// Valide spécifiquement une URL LinkedIn (doit commencer par https://linkedin.com ou https://www.linkedin.com)
export function sanitizeLinkedinUrl(value: string | null | undefined): string | null {
  const url = sanitizeUrl(value)
  if (!url) return null
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host !== 'linkedin.com') return null
    return url
  } catch {
    return null
  }
}
