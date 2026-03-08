"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
      window.location.href = "/connexion"
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

  return (
    <div className="min-h-screen py-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-[#3558A2]">Événements</h1>
          <p className="text-muted-foreground mt-2">Inscrivez-vous aux prochains événements de la communauté.</p>
        </div>

        {!isAuthenticated && (
          <div className="mb-6 rounded-lg border bg-[#ffe8e4] p-4 text-sm">
            Connectez-vous pour vous inscrire aux événements.
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
                        disabled={isRegistered || isSubmittingId === event.id}
                        onClick={() => handleRegister(event.id)}
                      >
                        {isSubmittingId === event.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Inscription...
                          </>
                        ) : isRegistered ? (
                          "Déjà inscrit"
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
    </div>
  )
}

