"use client"

import Image from "next/image"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { articles } from "@/lib/fake-data"
import { supabase } from "@/lib/supabase"
import { Calendar, User, ChevronLeft, ChevronRight, Loader2, Clock3, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

type FeedItem = {
  id: string
  title: string
  image: string
  category: string
  author: string
  date: string
  href: string
}

type EventRegistrationDetails = {
  id: string
  titre: string
  description: string
  date: string
  heure: string
  lieu: string
  image_url: string | null
  places_max: number | null
  lien_visio: string | null
  actif: boolean
  archive: boolean
  inscriptionsCount: number
}

export default function ActualitesPage() {
  const fallbackItems: FeedItem[] = articles.map((article) => ({
    id: article.id,
    title: article.title,
    image: article.image || "/placeholder.svg",
    category: article.category,
    author: article.author,
    date: article.date,
    href: `/actualites/${article.id}`,
  }))
  const [feedItems, setFeedItems] = useState<FeedItem[]>(fallbackItems)
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingFeed, setIsLoadingFeed] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmittingEventId, setIsSubmittingEventId] = useState<string | null>(null)
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set())
  const [externalRegisteredEventIds, setExternalRegisteredEventIds] = useState<Set<string>>(new Set())
  const [externalDialogEventId, setExternalDialogEventId] = useState<string | null>(null)
  const [eventDetailsDialogId, setEventDetailsDialogId] = useState<string | null>(null)
  const [eventDetails, setEventDetails] = useState<EventRegistrationDetails | null>(null)
  const [isLoadingEventDetails, setIsLoadingEventDetails] = useState(false)
  const [externalForm, setExternalForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    organisation: "",
  })
  const articlesPerPage = 6
  const categories = ["Tous", ...Array.from(new Set(feedItems.map((item) => item.category))).sort((a, b) => {
    if (a === "Événements") return 1
    if (b === "Événements") return -1
    return 0
  })]

  const filteredArticles =
    selectedCategory === "Tous"
      ? feedItems
      : feedItems.filter((item) => item.category === selectedCategory)

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const currentArticles = filteredArticles.slice(startIndex, endIndex)

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await fetch("/api/actualites/feed", { cache: "no-store" })
        const data = await res.json().catch(() => null)
        if (res.ok && Array.isArray(data?.items) && data.items.length > 0) {
          setFeedItems(data.items as FeedItem[])
        }
      } catch {
        // fallback silencieux vers les données locales
      } finally {
        setIsLoadingFeed(false)
      }
    }

    loadFeed()
  }, [])

  useEffect(() => {
    const loadSessionData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session
      setIsAuthenticated(!!session)
      if (!session?.user?.id) {
        setRegisteredEventIds(new Set())
        return
      }

      const { data: regs } = await (supabase.from("inscriptions_evenements") as any)
        .select("evenement_id")
        .eq("user_id", session.user.id)
      setRegisteredEventIds(new Set<string>((regs || []).map((r: any) => r.evenement_id)))
    }

    loadSessionData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const isEventItem = (item: FeedItem) => item.category === "Événements"

  const openEventDetailsDialog = async (eventId: string) => {
    setEventDetailsDialogId(eventId)
    setEventDetails(null)
    setIsLoadingEventDetails(true)
    try {
      const { data: eventData, error: eventError } = await (supabase.from("evenements") as any)
        .select("id, titre, description, date, heure, lieu, image_url, places_max, lien_visio, actif, archive")
        .eq("id", eventId)
        .single()
      if (eventError || !eventData) {
        alert("Impossible de charger les détails de l'événement")
        setEventDetailsDialogId(null)
        return
      }

      const { count } = await (supabase.from("inscriptions_evenements") as any)
        .select("*", { count: "exact", head: true })
        .eq("evenement_id", eventId)

      setEventDetails({
        ...(eventData as Omit<EventRegistrationDetails, "inscriptionsCount">),
        inscriptionsCount: count || 0,
      })
    } finally {
      setIsLoadingEventDetails(false)
    }
  }

  const handleRegister = async (eventId: string) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setEventDetailsDialogId(null)
      setExternalDialogEventId(eventId)
      return
    }

    setIsSubmittingEventId(eventId)
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
      setEventDetailsDialogId(null)
      alert("Inscription confirmée")
    } finally {
      setIsSubmittingEventId(null)
    }
  }

  const handleExternalRegister = async () => {
    if (!externalDialogEventId) return
    if (!externalForm.nom.trim() || !externalForm.prenom.trim() || !externalForm.email.trim()) {
      alert("Nom, prénom et email sont obligatoires")
      return
    }

    setIsSubmittingEventId(externalDialogEventId)
    try {
      const res = await fetch("/api/evenements/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setIsSubmittingEventId(null)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero image */}
      <section className="relative mx-4 mt-4 h-[320px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[420px] lg:mx-8 lg:h-[400px]">
        <Image src="/actualites/actualites3.jpg" alt="Actualités" fill className="object-cover hero-zoom" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-10 px-10 sm:pb-14 sm:px-20 lg:pb-16 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl lg:text-4xl">
            actualités
          </h1>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className={
                  category === "Événements"
                    ? category === selectedCategory
                      ? "bg-[#fcd116] text-black hover:bg-[#fcd116]/90"
                      : "border-[#fcd116] bg-[#fcd116]/20 text-foreground hover:bg-[#fcd116]/40 hover:text-black"
                    : category === selectedCategory
                      ? "bg-[#3558A2] hover:bg-[#3558A2]/90"
                      : "hover:bg-[#3558A2] hover:text-white"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0">
          {isLoadingFeed ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#3558A2]" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentArticles.map((article) => {
                const isEvent = isEventItem(article)
                const isRegistered = registeredEventIds.has(article.id)
                const isExternalRegistered = externalRegisteredEventIds.has(article.id)
                return (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group h-full !pt-0">
                    <Link href={article.href} className="block">
                    <div className="relative overflow-hidden">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-block px-3 py-1 bg-[#3558A2] text-white text-xs font-semibold rounded-full">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="pt-2">
                      <h3 className="font-serif text-lg font-bold mb-3 line-clamp-2 group-hover:text-[#3558A2] transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{article.date}</span>
                        </div>
                        {isEvent ? (
                          <Button
                            size="sm"
                            className="h-8 bg-[#3558A2] px-3 text-xs hover:bg-[#3558A2]/90"
                            disabled={isRegistered || isExternalRegistered || isSubmittingEventId === article.id}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              openEventDetailsDialog(article.id)
                            }}
                          >
                            {isSubmittingEventId === article.id ? (
                              <>
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ...
                              </>
                            ) : isRegistered ? (
                              "Inscrit"
                            ) : isExternalRegistered ? (
                              "Envoyée"
                            ) : (
                              "S'inscrire"
                            )}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{article.author}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    </Link>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="hidden gap-2 sm:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className={
                      currentPage === page
                        ? "bg-[#3558A2] hover:bg-[#3558A2]/90"
                        : "hover:bg-[#3558A2] hover:text-white"
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground sm:hidden">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!eventDetailsDialogId} onOpenChange={(open) => !open && setEventDetailsDialogId(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Détails de l'événement</DialogTitle>
          </DialogHeader>
          {isLoadingEventDetails || !eventDetails ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#3558A2]" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={eventDetails.image_url || "/placeholder.svg"}
                  alt={eventDetails.titre}
                  className="h-44 w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#3558A2]">{eventDetails.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{eventDetails.description}</p>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-[#3558A2]" />{new Date(eventDetails.date).toLocaleDateString("fr-FR")}</p>
                <p className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#3558A2]" />{eventDetails.heure}</p>
                <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#3558A2]" />{eventDetails.lieu}</p>
              </div>
              <p className="text-sm">
                <span className="font-medium">Inscriptions :</span> {eventDetails.inscriptionsCount}
                {eventDetails.places_max ? ` / ${eventDetails.places_max}` : " (illimité)"}
              </p>
              {eventDetails.lien_visio && (
                <p className="text-sm">
                  <span className="font-medium">Lien visio :</span>{" "}
                  <a href={eventDetails.lien_visio} target="_blank" rel="noopener noreferrer" className="text-[#3558A2] underline">
                    Rejoindre
                  </a>
                </p>
              )}
              {(!eventDetails.actif || eventDetails.archive) && (
                <p className="text-sm font-medium text-red-600">
                  Cet événement n'est plus ouvert aux inscriptions.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDetailsDialogId(null)}>Fermer</Button>
            <Button
              className="bg-[#3558A2] hover:bg-[#3558A2]/90"
              disabled={
                !eventDetails ||
                !eventDetailsDialogId ||
                !eventDetails.actif ||
                eventDetails.archive ||
                registeredEventIds.has(eventDetailsDialogId) ||
                externalRegisteredEventIds.has(eventDetailsDialogId) ||
                isSubmittingEventId === eventDetailsDialogId
              }
              onClick={() => eventDetailsDialogId && handleRegister(eventDetailsDialogId)}
            >
              {eventDetailsDialogId && isSubmittingEventId === eventDetailsDialogId
                ? "Validation..."
                : eventDetailsDialogId && (registeredEventIds.has(eventDetailsDialogId) || externalRegisteredEventIds.has(eventDetailsDialogId))
                ? "Déjà inscrit"
                : "Valider l'inscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contribuez CTA */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <a href="mailto:france.alumni@institutfrancais-guinee.fr">
            <Button className="mb-6 h-14 rounded-full bg-[#ea292c] px-10 text-lg font-semibold hover:bg-[#f48988]/90">
              contribuez
            </Button>
          </a>
          <p className="text-base text-muted-foreground">
            Vous êtes alumni ? Partagez vos idées et vos travaux avec la communauté. Proposez vos contenus (portraits, recherches, billets, études…) pour publication ici!
          </p>
        </div>
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
                <Input value={externalForm.nom} onChange={(e) => setExternalForm((prev) => ({ ...prev, nom: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Prénom *</Label>
                <Input value={externalForm.prenom} onChange={(e) => setExternalForm((prev) => ({ ...prev, prenom: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={externalForm.email} onChange={(e) => setExternalForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input value={externalForm.telephone} onChange={(e) => setExternalForm((prev) => ({ ...prev, telephone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Organisation</Label>
                <Input value={externalForm.organisation} onChange={(e) => setExternalForm((prev) => ({ ...prev, organisation: e.target.value }))} />
              </div>
            </div>
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                Vous pouvez aussi vous connecter pour suivre vos inscriptions.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExternalDialogEventId(null)}>Annuler</Button>
            <Button
              className="bg-[#3558A2] hover:bg-[#3558A2]/90"
              onClick={handleExternalRegister}
              disabled={!externalDialogEventId || isSubmittingEventId === externalDialogEventId}
            >
              {externalDialogEventId && isSubmittingEventId === externalDialogEventId ? "Inscription..." : "Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}