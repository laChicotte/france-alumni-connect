"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
  const [selectedType, setSelectedType] = useState<string>("Tous")
  const [selectedEvent, setSelectedEvent] = useState<EvenementWithType | null>(null)
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

  const typeFilters = ["Tous", ...Array.from(new Set(events.map((event) => event.types_evenements?.libelle || "Événement")))]
  const filteredEvents = selectedType === "Tous"
    ? events
    : events.filter((event) => (event.types_evenements?.libelle || "Événement") === selectedType)

  const openEventDetails = (event: EvenementWithType) => {
    setSelectedEvent(event)
  }

  return (
    <div className="min-h-screen">
      <section className="relative mx-4 mt-4 h-[320px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[420px] lg:mx-8 lg:h-[400px]">
        <Image src="/evenements/evenements.jpg" alt="Événements" fill className="object-cover hero-zoom" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-end px-10 pb-10 sm:px-20 sm:pb-14 lg:px-32 lg:pb-16">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl lg:text-4xl">
            événements
          </h1>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap gap-3">
            {typeFilters.map((type) => (
              <Button
                key={type}
                variant={type === selectedType ? "default" : "outline"}
                className={type === selectedType ? "bg-[#3558A2] hover:bg-[#3558A2]/90" : "hover:bg-[#3558A2] hover:text-white"}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#3558A2]" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Aucun événement disponible pour le moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const isRegistered = registeredEventIds.has(event.id)
              const isExternalRegistered = externalRegisteredEventIds.has(event.id)
              return (
                <Card
                  key={event.id}
                  className="group h-full cursor-pointer overflow-hidden border-[#3558A2]/20 !pt-0 transition-shadow hover:shadow-lg"
                  onClick={() => openEventDetails(event)}
                >
                  <div className="relative overflow-hidden">
                    <img src={event.image_url || "/placeholder.svg"} alt={event.titre} className="h-44 w-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block rounded-full bg-[#3558A2] px-3 py-1 text-xs font-semibold text-white">
                        {event.types_evenements?.libelle || "Événement"}
                      </span>
                    </div>
                  </div>
                  <CardContent className="space-y-3 pt-2">
                    <h2 className="font-serif text-xl font-bold line-clamp-2 transition-colors group-hover:text-[#3558A2]">{event.titre}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-[#3558A2]" />
                          {new Date(event.date).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-4 w-4 text-[#3558A2]" />
                          {event.heure}
                        </span>
                        <span className="text-right">
                          {event.places_max ? `${event.places_max} places` : "illimité"}
                        </span>
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
                        onClick={(e) => {
                          e.stopPropagation()
                          openEventDetails(event)
                        }}
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
        </div>
      </section>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Détails de l&apos;événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={selectedEvent.image_url || "/placeholder.svg"}
                  alt={selectedEvent.titre}
                  className="h-44 w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#3558A2]">{selectedEvent.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#3558A2]" />
                  {new Date(selectedEvent.date).toLocaleDateString("fr-FR")}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#3558A2]" />
                  {selectedEvent.heure}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#3558A2]" />
                  {selectedEvent.lieu}
                </p>
              </div>
              <p className="text-sm">
                <span className="font-medium">Places :</span>{" "}
                {selectedEvent.places_max ? `${selectedEvent.places_max} max` : "illimitées"}
              </p>
              {selectedEvent.lien_visio && (
                <p className="text-sm">
                  <span className="font-medium">Lien visio :</span>{" "}
                  <a
                    href={selectedEvent.lien_visio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3558A2] underline"
                  >
                    Rejoindre
                  </a>
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>Annuler</Button>
            <Button
              className="bg-[#3558A2] hover:bg-[#3558A2]/90"
              disabled={
                !selectedEvent ||
                registeredEventIds.has(selectedEvent.id) ||
                externalRegisteredEventIds.has(selectedEvent.id) ||
                isSubmittingId === selectedEvent.id
              }
              onClick={() => selectedEvent && handleRegister(selectedEvent.id)}
            >
              {selectedEvent && isSubmittingId === selectedEvent.id
                ? "Inscription..."
                : selectedEvent && (registeredEventIds.has(selectedEvent.id) || externalRegisteredEventIds.has(selectedEvent.id))
                ? "Déjà inscrit"
                : "Valider l'inscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!externalDialogEventId} onOpenChange={(open) => !open && setExternalDialogEventId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inscription externe</DialogTitle>
            <p className="pt-1 text-xs text-muted-foreground">
              <Link
                href="/connexion"
                className="text-[#3558A2] hover:underline"
                onClick={() => setExternalDialogEventId(null)}
              >
                Me connecter
              </Link>
            </p>
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

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <a href="mailto:france.alumni@institutfrancais-guinee.fr">
            <Button className="mb-6 h-14 rounded-full bg-[#ea292c] px-10 text-lg font-semibold hover:bg-[#f48988]/90">
              proposez votre événement
            </Button>
          </a>
          <p className="text-base text-muted-foreground">
          Vous êtes alumni ? Partagez vos idées d'événements utiles à la communauté qui pourraient être organisés par France Alumni Guinée
          </p>
        </div>
      </section>

      <style jsx>{`
        .hero-zoom {
          animation: zoom-breathe 10s ease-in-out infinite;
          transform-origin: center center;
        }
        @keyframes zoom-breathe {
          0%,
          100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}

