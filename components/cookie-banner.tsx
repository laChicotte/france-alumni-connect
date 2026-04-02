"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type CookieConsent = {
  essential: true
  preferences: boolean
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

const CONSENT_STORAGE_KEY = "fac_cookie_consent_v1"

function saveConsent(consent: CookieConsent) {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
  const maxAge = 60 * 60 * 24 * 180 // 180 jours
  document.cookie = `fac_cookie_consent=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=${maxAge}; samesite=lax`
}

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [preferences, setPreferences] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const existing = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!existing) {
      setIsOpen(true)
      return
    }
    try {
      const parsed = JSON.parse(existing) as Partial<CookieConsent>
      setPreferences(!!parsed.preferences)
      setAnalytics(!!parsed.analytics)
      setMarketing(!!parsed.marketing)
    } catch {
      setIsOpen(true)
    }
  }, [])

  const acceptAll = () => {
    saveConsent({
      essential: true,
      preferences: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    })
    setIsOpen(false)
  }

  const refuseOptional = () => {
    saveConsent({
      essential: true,
      preferences: false,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    })
    setIsOpen(false)
  }

  const saveCustom = () => {
    saveConsent({
      essential: true,
      preferences,
      analytics,
      marketing,
      updatedAt: new Date().toISOString(),
    })
    setIsCustomizeOpen(false)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[200] border-t bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-700">
            Nous utilisons des cookies pour le fonctionnement du site et, avec votre accord, pour ameliorer votre experience.
            {" "}
            <Link href="/politique-cookies" className="font-semibold text-[#3558A2] underline underline-offset-2">
              En savoir plus
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCustomizeOpen(true)}>
              Personnaliser
            </Button>
            <Button variant="outline" size="sm" onClick={refuseOptional}>
              Refuser
            </Button>
            <Button size="sm" className="bg-[#3558A2] hover:bg-[#3558A2]/90" onClick={acceptAll}>
              Accepter
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Preferences cookies</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-md border p-3">
              <p className="font-medium">Essentiels (obligatoires)</p>
              <p className="text-muted-foreground">Connexion, securite et fonctionnement du site.</p>
            </div>
            <label className="flex items-start gap-3 rounded-md border p-3">
              <input type="checkbox" checked={preferences} onChange={(e) => setPreferences(e.target.checked)} className="mt-1" />
              <span>
                <span className="font-medium">Preferences</span>
                <span className="block text-muted-foreground">Memorisation de vos choix d&apos;interface.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-md border p-3">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1" />
              <span>
                <span className="font-medium">Mesure d&apos;audience</span>
                <span className="block text-muted-foreground">Statistiques de frequentation anonymisees.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-md border p-3">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1" />
              <span>
                <span className="font-medium">Marketing</span>
                <span className="block text-muted-foreground">Cookies de campagnes et attribution.</span>
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomizeOpen(false)}>Annuler</Button>
            <Button className="bg-[#3558A2] hover:bg-[#3558A2]/90" onClick={saveCustom}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
