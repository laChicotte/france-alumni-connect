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
import { CalendarDays, Clock3, MapPin, Loader2, User, BookOpen, Euro } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Formation } from "@/types/database.types"

interface FormationWithType extends Formation {
  types_formations?: { libelle: string } | null
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR")
}

function formatDateRange(debut: string, fin: string | null) {
  if (!fin || fin === debut) return formatDate(debut)
  return `${formatDate(debut)} → ${formatDate(fin)}`
}

function formatHeures(debut: string, fin: string | null) {
  if (!fin) return debut
  return `${debut} - ${fin}`
}

export default function FormationPage() {
  const [formations, setFormations] = useState<FormationWithType[]>([])
  const [selectedType, setSelectedType] = useState<string>("Tous")
  const [selectedFormation, setSelectedFormation] = useState<FormationWithType | null>(null)
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingId, setIsSubmittingId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [externalDialogId, setExternalDialogId] = useState<string | null>(null)
  const [externalRegisteredIds, setExternalRegisteredIds] = useState<Set<string>>(new Set())
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

    const { data: formationsData } = await supabase
      .from("formations")
      .select("*, types_formations(libelle)")
      .eq("statut", "publiee")
      .eq("actif", true)
      .order("date_debut", { ascending: true })

    setFormations((formationsData as FormationWithType[]) || [])

    if (session?.user?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: regs } = await (supabase.from("inscriptions_formations") as any)
        .select("formation_id")
        .eq("user_id", session.user.id)

      const ids = new Set<string>((regs || []).map((r: any) => r.formation_id))
      setRegisteredIds(ids)
    }

    setIsLoading(false)
  }

  const handleRegister = async (formationId: string) => {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setExternalDialogId(formationId)
      return
    }

    setIsSubmittingId(formationId)
    try {
      const res = await fetch("/api/formations/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ formation_id: formationId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || "Impossible de vous inscrire pour le moment")
        return
      }

      setRegisteredIds((prev) => new Set(prev).add(formationId))
    } finally {
      setIsSubmittingId(null)
    }
  }

  const handleExternalRegister = async () => {
    if (!externalDialogId) return
    if (!externalForm.nom.trim() || !externalForm.prenom.trim() || !externalForm.email.trim()) {
      alert("Nom, prénom et email sont obligatoires")
      return
    }

    setIsSubmittingId(externalDialogId)
    try {
      const res = await fetch("/api/formations/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formation_id: externalDialogId,
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

      setExternalRegisteredIds((prev) => new Set(prev).add(externalDialogId))
      setExternalDialogId(null)
      setExternalForm({ nom: "", prenom: "", email: "", telephone: "", organisation: "" })
      alert("Inscription enregistrée avec succès")
    } finally {
      setIsSubmittingId(null)
    }
  }

  const typeFilters = ["Tous", ...Array.from(new Set(formations.map((f) => f.types_formations?.libelle || "Formation")))]
  const filteredFormations =
    selectedType === "Tous"
      ? formations
      : formations.filter((f) => (f.types_formations?.libelle || "Formation") === selectedType)

  return (
    <div className="min-h-screen">
      <section className="relative mx-4 mt-4 h-[320px] overflow-hidden rounded-3xl sm:mx-6 sm:h-[420px] lg:mx-8 lg:h-[400px]">
        <Image src="/formation/formation.jpeg" alt="Formation" fill className="object-cover hero-zoom" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full flex-col justify-end pb-10 px-10 sm:pb-14 sm:px-20 lg:pb-16 lg:px-32">
          <h1 className="inline-block w-fit bg-[#3558A2] px-3 py-2 font-serif text-2xl font-bold leading-none text-white sm:text-3xl lg:text-4xl">
            formations
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
          ) : filteredFormations.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Aucune formation disponible pour le moment.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFormations.map((formation) => {
                const isRegistered = registeredIds.has(formation.id)
                const isExternalRegistered = externalRegisteredIds.has(formation.id)
                return (
                  <Card
                    key={formation.id}
                    className="group h-full cursor-pointer overflow-hidden border-[#3558A2]/20 !pt-0 transition-shadow hover:shadow-lg"
                    onClick={() => setSelectedFormation(formation)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={formation.image_url || "/placeholder.svg"}
                        alt={formation.titre}
                        className="h-44 w-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-block rounded-full bg-[#3558A2] px-3 py-1 text-xs font-semibold text-white">
                          {formation.types_formations?.libelle || "Formation"}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${formation.gratuit ? "bg-green-500 text-white" : "bg-amber-500 text-white"}`}>
                          {formation.gratuit ? "Gratuit" : formation.prix ? `${formation.prix.toLocaleString("fr-FR")} GNF` : "Payant"}
                        </span>
                      </div>
                    </div>
                    <CardContent className="space-y-3 pt-2">
                      <h2 className="font-serif text-xl font-bold line-clamp-2 transition-colors group-hover:text-[#3558A2]">
                        {formation.titre}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2">{formation.description}</p>

                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#3558A2] shrink-0" />
                          <span className="text-xs">{formatDateRange(formation.date_debut, formation.date_fin)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-4 w-4 text-[#3558A2]" />
                            {formatHeures(formation.heure_debut, formation.heure_fin)} <span className="text-muted-foreground/60">(GMT)</span>
                          </span>
                          <span>{formation.places_max ? `${formation.places_max} places` : "illimité"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#3558A2] shrink-0" />
                          <span className="text-xs truncate">{formation.lieu}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          className="w-full bg-[#3558A2] hover:bg-[#3558A2]/90"
                          disabled={isRegistered || isExternalRegistered || isSubmittingId === formation.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFormation(formation)
                          }}
                        >
                          {isSubmittingId === formation.id ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Inscription...</>
                          ) : isRegistered ? (
                            "Déjà inscrit"
                          ) : isExternalRegistered ? (
                            "Inscription envoyée"
                          ) : (
                            <><User className="h-4 w-4 mr-2" />S&apos;inscrire</>
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

      {/* Dialog détail formation */}
      <Dialog open={!!selectedFormation} onOpenChange={(open) => !open && setSelectedFormation(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle>Détails de la formation</DialogTitle>
          </DialogHeader>
          {selectedFormation && (
            <div className="space-y-5 pt-1">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={selectedFormation.image_url || "/placeholder.svg"}
                  alt={selectedFormation.titre}
                  className="h-44 w-full object-cover"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedFormation.types_formations?.libelle && (
                  <Badge className="bg-[#3558A2] text-white">{selectedFormation.types_formations.libelle}</Badge>
                )}
                <Badge className={selectedFormation.gratuit ? "bg-green-500 text-white" : "bg-amber-500 text-white"}>
                  {selectedFormation.gratuit ? "Gratuit" : selectedFormation.prix ? `${selectedFormation.prix.toLocaleString("fr-FR")} GNF` : "Payant"}
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#3558A2]">{selectedFormation.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{selectedFormation.description}</p>
              </div>

              {selectedFormation.programme && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase text-[#3558A2] mb-2 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Programme
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedFormation.programme}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-[#3558A2] shrink-0" />
                  <span>{formatDateRange(selectedFormation.date_debut, selectedFormation.date_fin)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-[#3558A2] shrink-0" />
                  <span>{formatHeures(selectedFormation.heure_debut, selectedFormation.heure_fin)} <span className="text-muted-foreground/60 text-xs">(GMT)</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-[#3558A2] shrink-0" />
                  <span>{selectedFormation.lieu}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Places :</span>{" "}
                  {selectedFormation.places_max ? `${selectedFormation.places_max} max` : "illimitées"}
                </div>
              </div>

              {selectedFormation.lien_visio && (
                <p className="text-sm">
                  <span className="font-medium">Lien visio :</span>{" "}
                  <a href={selectedFormation.lien_visio} target="_blank" rel="noopener noreferrer" className="text-[#3558A2] underline">
                    Rejoindre
                  </a>
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFormation(null)}>Annuler</Button>
            <Button
              className="bg-[#3558A2] hover:bg-[#3558A2]/90"
              disabled={
                !selectedFormation ||
                registeredIds.has(selectedFormation.id) ||
                externalRegisteredIds.has(selectedFormation.id) ||
                isSubmittingId === selectedFormation.id
              }
              onClick={() => selectedFormation && handleRegister(selectedFormation.id)}
            >
              {selectedFormation && isSubmittingId === selectedFormation.id
                ? "Inscription..."
                : selectedFormation && (registeredIds.has(selectedFormation.id) || externalRegisteredIds.has(selectedFormation.id))
                ? "Déjà inscrit"
                : "Valider l'inscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog inscription externe */}
      <Dialog open={!!externalDialogId} onOpenChange={(open) => !open && setExternalDialogId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inscription externe</DialogTitle>
            <p className="pt-1 text-xs text-muted-foreground">
              <Link href="/connexion" className="text-[#3558A2] hover:underline" onClick={() => setExternalDialogId(null)}>
                Me connecter
              </Link>
            </p>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExternalDialogId(null)}>Annuler</Button>
            <Button
              className="bg-[#3558A2] hover:bg-[#3558A2]/90"
              onClick={handleExternalRegister}
              disabled={!externalDialogId || isSubmittingId === externalDialogId}
            >
              {externalDialogId && isSubmittingId === externalDialogId ? "Inscription..." : "Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Link href="/formation/proposer">
            <Button className="mb-6 h-14 rounded-full bg-[#ea292c] px-10 text-lg font-semibold hover:bg-[#ea292c]/90">
              proposez votre formation
            </Button>
          </Link>
          <p className="text-base text-muted-foreground">
            Vous êtes alumni ? Partagez vos connaissances en proposant une formation utile à la communauté
          </p>
        </div>
      </section>

      <style jsx>{`
        .hero-zoom {
          animation: zoom-breathe 10s ease-in-out infinite;
          transform-origin: center center;
        }
        @keyframes zoom-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
