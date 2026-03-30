"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarDays, Clock3, MapPin, Loader2, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Evenement } from "@/types/database.types"

interface EvenementWithType extends Evenement {
  types_evenements?: { libelle: string } | null
}

export default function EvenementsPublicPage() {
  const [events, setEvents] = useState<EvenementWithType[]>([])
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [externalDialogEventId, setExternalDialogEventId] = useState<string | null>(null)
  const [externalRegisteredEventIds, setExternalRegisteredEventIds] = useState<Set<string>>(new Set())
  const [externalForm, setExternalForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    organisation: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session
    setIsAuthenticated(!!session)

    const { data: eventsData } = await supabase
      .from("evenements")
      .select("*, types_evenements(libelle)")
      .eq("actif", true)
      .eq("archive", false)
      .order("date", { ascending: true })

    setEvents((eventsData as EvenementWithType[]) || [])

    if (session?.user?.id) {
      const { data: regs } = await (supabase.from("inscriptions_evenements") as any)
        .select("evenement_id")
        .eq("user_id", session.user.id)

      const ids = new Set<string>((regs || []).map((r: any) => r.evenement_id))
      setRegisteredEventIds(ids)
    } else {
      setRegisteredEventIds(new Set())
    }

    setIsLoading(false)
  }

  const handleRegister = async (eventId: string) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setExternalDialogEventId(eventId)
      return
    }

    setIsSubmittingId(eventId)
    try {
      const res = await fetch("/api/evenements/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ evenement_id: eventId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || "Impossible de vous inscrire pour le moment")
        return
      }

      setRegisteredEventIds((prev) => new Set(prev).add(eventId))
    } finally {
      setIsSubmittingId(null)
    }
  }

  const handleExternalRegister = async () => {
    if (!externalDialogEventId) return
    if (!externalForm.nom.trim() || !externalForm.prenom.trim() || !externalForm.email.trim()) {
      alert("Nom, prénom et email sont obligatoires")
      return
    }

    setIsSubmittingId(externalDialogEventId)
    try {
      const res = await fetch("/api/evenements/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evenement_id: externalDialogEventId,
          nom_externe: externalForm.nom.trim(),
          prenom_externe: externalForm.prenom.trim(),
          email_externe: externalForm.email.trim().toLowerCase(),
          telephone_externe: externalForm.telephone.trim() || null,
          organisation_externe: externalForm.organisation.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || "Impossible de vous inscrire pour le moment")
        return
      }

      setExternalRegisteredEventIds((prev) => new Set(prev).add(externalDialogEventId))
      setExternalDialogEventId(null)
      setExternalForm({ nom: "", prenom: "", email: "", telephone: "", organisation: "" })
      alert("Inscription enregistrée avec succès")
    } finally {
      setIsSubmittingId(null)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-[#3558A2]">Événements</h1>
          <p className="text-muted-foreground mt-2">Inscrivez-vous aux prochains événements de la communauté.</p>
        </div>

        {!isAuthenticated && (
          <div className="mb-6 rounded-lg border bg-[#ffe8e4] p-4 text-sm">
            Vous pouvez vous inscrire en tant qu'invité, ou vous connecter pour retrouver vos inscriptions.
            <Link href="/connexion" className="ml-2 font-semibold text-[#3558A2] underline">
              Se connecter
            </Link>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#3558A2]" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Aucun événement disponible pour le moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const isRegistered = registeredEventIds.has(event.id)
              const isExternalRegistered = externalRegisteredEventIds.has(event.id)
              return (
                <Card key={event.id} className="overflow-hidden border-[#3558A2]/20">
                  <img src={event.image_url || "/placeholder.svg"} alt={event.titre} className="h-44 w-full object-cover" />
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{event.types_evenements?.libelle || "Événement"}</Badge>
                      {event.places_max ? (
                        <span className="text-xs text-muted-foreground">Places max: {event.places_max}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Places illimitées</span>
                      )}
                    </div>

                    <h2 className="font-serif text-xl font-bold line-clamp-2">{event.titre}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#3558A2]" />
                        {new Date(event.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-[#3558A2]" />
                        {event.heure}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#3558A2]" />
                        {event.lieu}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        className="w-full bg-[#3558A2] hover:bg-[#3558A2]/90"
                        disabled={isRegistered || isExternalRegistered || isSubmittingId === event.id}
                        onClick={() => handleRegister(event.id)}
                      >
                        {isSubmittingId === event.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Inscription...
                          </>
                        ) : isRegistered ? (
                          "Déjà inscrit"
                        ) : isExternalRegistered ? (
                          "Inscription envoyée"
                        ) : (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            S'inscrire
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <Dialog open={!!externalDialogEventId} onOpenChange={(open) => !open && setExternalDialogEventId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inscription externe</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nom *</Label>
                <Input
                  value={externalForm.nom}
                  onChange={(e) => setExternalForm((prev) => ({ ...prev, nom: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prénom *</Label>
                <Input
                  value={externalForm.prenom}
                  onChange={(e) => setExternalForm((prev) => ({ ...prev, prenom: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                value={externalForm.email}
                onChange={(e) => setExternalForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input
                  value={externalForm.telephone}
                  onChange={(e) => setExternalForm((prev) => ({ ...prev, telephone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Organisation</Label>
                <Input
                  value={externalForm.organisation}
                  onChange={(e) => setExternalForm((prev) => ({ ...prev, organisation: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExternalDialogEventId(null)}>Annuler</Button>
            <Button
              className="bg-[#3558A2] hover:bg-[#3558A2]/90"
              onClick={handleExternalRegister}
              disabled={!externalDialogEventId || isSubmittingId === externalDialogEventId}
            >
              {externalDialogEventId && isSubmittingId === externalDialogEventId ? "Inscription..." : "Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

