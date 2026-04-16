"use client"

import { useEffect, useState } from "react"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, MoreHorizontal, Eye, EyeOff, Loader2, Download, User, Phone, MapPin, GraduationCap, Briefcase, FileText, Calendar, Globe, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { AlumniProfile, Secteur } from "@/types/database.types"
import { downloadCsv } from "@/lib/export/csv"

interface AlumniWithSecteur extends AlumniProfile {
  secteurs?: { libelle: string } | null
  users?: { email: string } | null
  statuts_professionnels?: { libelle: string } | null
}

const DIPLOME_LABELS: Record<string, string> = {
  bts: 'BTS', dut: 'DUT', du: 'DU', de: 'DE', deug: 'DEUG',
  prepa: 'Classe Prépa', ecole_ingenieur: "École d'ingénieur",
  ecole_specialisee: 'École spécialisée', licence_pro: 'Licence professionnelle',
  licence: 'Licence', master1: 'Master 1', master2: 'Master 2',
  doctorat: 'Doctorat', post_doctorat: 'Post Doctorat', autre: 'Autre',
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumniWithSecteur[]>([])
  const [secteurs, setSecteurs] = useState<Secteur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSecteur, setFilterSecteur] = useState<string>("all")
  const [filterVisible, setFilterVisible] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniWithSecteur | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAlumni()
    fetchSecteurs()
  }, [])

  const fetchAlumni = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('alumni_profiles')
      .select('*, secteurs(libelle), users(email), statuts_professionnels(libelle)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur:', error)
    } else {
      setAlumni(data || [])
    }
    setIsLoading(false)
  }

  const fetchSecteurs = async () => {
    const { data } = await supabase
      .from('secteurs')
      .select('*')
      .order('ordre')
    setSecteurs(data || [])
  }

  const handleVisibilityChange = async (profile: AlumniWithSecteur, visible: boolean) => {
    setIsSubmitting(true)
    const { error } = await supabase
      .from('alumni_profiles')
      .update({ visible_annuaire: visible })
      .eq('id', profile.id)

    if (!error) {
      fetchAlumni()
    }
    setIsSubmitting(false)
    setDialogAction(null)
    setSelectedAlumni(null)
  }

  const filteredAlumni = alumni.filter(profile => {
    const matchesSearch =
      profile.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.universite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.ville.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSecteur = filterSecteur === 'all' || profile.secteur_id === filterSecteur
    const matchesVisible = filterVisible === 'all' ||
      (filterVisible === 'visible' && profile.visible_annuaire) ||
      (filterVisible === 'masque' && !profile.visible_annuaire)

    const profileDate = new Date(profile.created_at)
    const matchesStartDate = !startDate || profileDate >= new Date(`${startDate}T00:00:00`)
    const matchesEndDate = !endDate || profileDate <= new Date(`${endDate}T23:59:59`)

    return matchesSearch && matchesSecteur && matchesVisible && matchesStartDate && matchesEndDate
  })

  const handleExportCsv = () => {
    const rows = filteredAlumni.map((profile) => ({
      id: profile.id,
      nom: profile.nom,
      prenom: profile.prenom,
      email: profile.users?.email || "",
      genre: profile.genre,
      telephone: profile.telephone,
      ville: profile.ville,
      universite: profile.universite,
      annee_promotion: profile.annee_promotion,
      diplome: profile.diplome,
      formation_domaine: profile.formation_domaine,
      secteur: profile.secteurs?.libelle || "",
      entreprise: profile.entreprise || "",
      poste_actuel: profile.poste_actuel || "",
      visible_annuaire: profile.visible_annuaire ? "oui" : "non",
      plan_retour: profile.plan_retour || "",
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }))
    downloadCsv(`alumni_${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  return (
    <AdminWrapper>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profils Alumni</h1>
          <p className="text-gray-500">Gérez les profils des anciens étudiants</p>
          <div className="mt-3">
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, université, ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSecteur} onValueChange={setFilterSecteur}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {secteurs.map((secteur) => (
                  <SelectItem key={secteur.id} value={secteur.id}>
                    {secteur.libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterVisible} onValueChange={setFilterVisible}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Visibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="masque">Masqué</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-[170px]"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-[170px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des profils ({filteredAlumni.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Université</TableHead>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Visibilité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun profil trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlumni.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.prenom} {profile.nom}
                      </TableCell>
                      <TableCell>{profile.universite}</TableCell>
                      <TableCell>{profile.annee_promotion}</TableCell>
                      <TableCell>
                        {profile.secteurs?.libelle || '-'}
                      </TableCell>
                      <TableCell>{profile.ville}</TableCell>
                      <TableCell>
                        {profile.visible_annuaire ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <Eye className="h-3 w-3 mr-1" /> Visible
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                            <EyeOff className="h-3 w-3 mr-1" /> Masqué
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAlumni(profile)
                                setDialogAction('view')
                              }}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {profile.visible_annuaire ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAlumni(profile)
                                  setDialogAction('hide')
                                }}
                              >
                                <EyeOff className="mr-2 h-4 w-4" />
                                Masquer de l'annuaire
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAlumni(profile)
                                  setDialogAction('show')
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Afficher dans l'annuaire
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Voir profil */}
      <Dialog open={dialogAction === 'view'} onOpenChange={() => { setDialogAction(null); setSelectedAlumni(null) }}>
        <DialogContent className="max-w-3xl max-h-[70vh] overflow-y-auto mt-[5vh]">
          <DialogHeader>
            <DialogTitle>Profil complet</DialogTitle>
          </DialogHeader>
          {selectedAlumni && (
            <div className="space-y-6 py-2">
              {/* En-tête photo + nom */}
              <div className="flex items-center gap-4">
                {selectedAlumni.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedAlumni.photo_url}
                    alt={`${selectedAlumni.prenom} ${selectedAlumni.nom}`}
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-xl font-bold">{selectedAlumni.prenom} {selectedAlumni.nom}</p>
                  <p className="text-sm text-gray-500">{selectedAlumni.users?.email || '-'}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedAlumni.visible_annuaire ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedAlumni.visible_annuaire ? 'Visible annuaire' : 'Masqué annuaire'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#3558A2] border-b border-[#3558A2]/20 pb-1 mb-3">Informations personnelles</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Genre</p><p>{selectedAlumni.genre || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Nationalité</p><p>{selectedAlumni.nationalite || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Téléphone</p><p>{selectedAlumni.telephone || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Ville</p><p>{selectedAlumni.ville || '-'}</p></div>
                  </div>
                </div>
              </div>

              {/* Formation */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#3558A2] border-b border-[#3558A2]/20 pb-1 mb-3">Formation</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Université</p><p>{selectedAlumni.universite || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Promotion</p><p>{selectedAlumni.annee_promotion || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Diplôme</p><p>{DIPLOME_LABELS[selectedAlumni.diplome] || selectedAlumni.diplome || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Domaine</p><p>{selectedAlumni.formation_domaine || '-'}</p></div>
                  </div>
                  <div className="col-span-2 flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Bourse</p><p>{selectedAlumni.bourse || 'Non renseigné'}</p></div>
                  </div>
                </div>
              </div>

              {/* Situation professionnelle */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#3558A2] border-b border-[#3558A2]/20 pb-1 mb-3">Situation professionnelle</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Statut</p><p>{selectedAlumni.statuts_professionnels?.libelle || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Secteur</p><p>{selectedAlumni.secteurs?.libelle || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Entreprise</p><p>{selectedAlumni.entreprise || '-'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Poste actuel</p><p>{selectedAlumni.poste_actuel || '-'}</p></div>
                  </div>
                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-gray-400">Plan de retour</p><p>{selectedAlumni.plan_retour || '-'}</p></div>
                  </div>
                </div>
              </div>

              {/* Biographie */}
              {selectedAlumni.bio && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#3558A2] border-b border-[#3558A2]/20 pb-1 mb-3">Biographie</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAlumni.bio}</p>
                </div>
              )}

              {/* Liens */}
              <div className="flex flex-wrap gap-3">
                {selectedAlumni.linkedin_url && (
                  <a
                    href={selectedAlumni.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-[#3558A2] hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {selectedAlumni.document_diplome_url && (
                  <a
                    href={selectedAlumni.document_diplome_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-[#3558A2] hover:underline"
                  >
                    <FileText className="h-4 w-4" /> Voir le diplôme
                  </a>
                )}
              </div>

              {/* Date d'inscription */}
              <p className="text-xs text-gray-400">
                Inscrit le {new Date(selectedAlumni.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); setSelectedAlumni(null) }}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Hide */}
      <Dialog open={dialogAction === 'hide'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masquer le profil</DialogTitle>
            <DialogDescription>
              Voulez-vous masquer le profil de {selectedAlumni?.prenom} {selectedAlumni?.nom} de l'annuaire ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => selectedAlumni && handleVisibilityChange(selectedAlumni, false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Masquer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Show */}
      <Dialog open={dialogAction === 'show'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Afficher le profil</DialogTitle>
            <DialogDescription>
              Voulez-vous afficher le profil de {selectedAlumni?.prenom} {selectedAlumni?.nom} dans l'annuaire ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => selectedAlumni && handleVisibilityChange(selectedAlumni, true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Afficher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminWrapper>
  )
}
