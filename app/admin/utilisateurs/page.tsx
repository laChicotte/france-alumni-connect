"use client"

import { useEffect, useState } from "react"
import { AdminWrapper } from "@/components/admin/admin-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MoreHorizontal, Check, Ban, UserCog, Loader2, Plus, AlertCircle, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { User, UserRole } from "@/types/database.types"
import { toast } from "sonner"

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // État pour le formulaire d'ajout admin/moderateur
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 5

  // État pour le formulaire d'ajout admin/moderateur
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    role: "moderateur" as UserRole
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur:', error)
    } else {
      setUsers(data || [])
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (user: User, newStatus: 'actif' | 'banni') => {
    setIsSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("Session expirée. Veuillez vous reconnecter.")
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/admin/utilisateurs/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(`Modification échouée: ${result.error || 'Erreur inconnue'}`)
        setIsSubmitting(false)
        return
      }

      const label = newStatus === 'banni' ? 'Utilisateur banni.' : user.status === 'banni' ? 'Utilisateur débanni.' : 'Compte validé.'
      toast.success(
        result.emailSent
          ? `${label} Email envoyé.`
          : `${label} Email non envoyé: ${result.emailError || 'vérifiez la configuration Resend.'}`
      )
      fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      toast.error(`Modification échouée: ${message}`)
    }

    setIsSubmitting(false)
    setDialogAction(null)
    setSelectedUser(null)
  }

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    setIsSubmitting(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('users') as any)
      .update({ role: newRole })
      .eq('id', user.id)

    if (error) {
      toast.error(`Modification échouée: ${error.message}`)
    } else {
      toast.success(`Rôle de ${user.email} mis à jour.`)
      fetchUsers()
    }
    setIsSubmitting(false)
    setDialogAction(null)
    setSelectedUser(null)
  }

  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteUser = async (user: User) => {
    setIsSubmitting(true)
    setDeleteError(null)

    try {
      // Appeler la fonction RPC qui supprime complètement l'utilisateur
      // (auth.users + users + alumni_profiles)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc('delete_user_completely', {
        user_id_to_delete: user.id
      })

      if (error) {
        console.error('Erreur suppression:', error)
        setDeleteError(`Erreur: ${error.message || 'Impossible de supprimer l\'utilisateur'}`)
        setIsSubmitting(false)
        return
      }

      // Succès
      toast.success(`Utilisateur ${user.email} supprimé définitivement.`)
      fetchUsers()
      setDialogAction(null)
      setSelectedUser(null)

    } catch (err) {
      console.error('Erreur:', err)
      setDeleteError('Une erreur est survenue lors de la suppression')
    }

    setIsSubmitting(false)
  }

  const handleAddUser = async () => {
    setIsSubmitting(true)
    setAddError(null)

    // Validation
    if (!newUser.email || !newUser.password || !newUser.nom || !newUser.prenom) {
      setAddError("Tous les champs sont obligatoires")
      setIsSubmitting(false)
      return
    }

    if (newUser.password.length < 6) {
      setAddError("Le mot de passe doit contenir au moins 6 caractères")
      setIsSubmitting(false)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setAddError("Session expirée. Veuillez vous reconnecter.")
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/admin/creer-utilisateur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          nom: newUser.nom,
          prenom: newUser.prenom,
          role: newUser.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setAddError(result.error || "Une erreur est survenue")
        setIsSubmitting(false)
        return
      }

      // Succès
      toast.success(`Compte créé pour ${newUser.email}.`)
      setShowAddDialog(false)
      setNewUser({
        email: "",
        password: "",
        nom: "",
        prenom: "",
        role: "moderateur"
      })
      fetchUsers()

    } catch (err) {
      console.error('Erreur:', err)
      setAddError("Une erreur est survenue")
    }

    setIsSubmitting(false)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    const matchesRole = filterRole === 'all' || user.role === filterRole

    return matchesSearch && matchesStatus && matchesRole
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Actif</Badge>
      case 'en_attente':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>
      case 'banni':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Banni</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Admin</Badge>
      case 'moderateur':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Modérateur</Badge>
      case 'alumni':
        return <Badge variant="outline">Alumni</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <AdminWrapper>
      <div className="p-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
            <p className="text-gray-500">Gérez les comptes utilisateurs de la plateforme</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-[#3558A2] hover:bg-[#3558A2]/90">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un administrateur
          </Button>
        </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-1">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="banni">Banni</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderateur">Modérateur</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div style={{ minHeight: '320px' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.prenom && user.nom
                          ? `${user.prenom} ${user.nom}`
                          : <span className="text-gray-400 italic">Non renseigné</span>
                        }
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
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
                            {user.status === 'en_attente' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setDialogAction('validate')
                                }}
                              >
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                                Valider le compte
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'banni' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setDialogAction('ban')
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4 text-red-600" />
                                Bannir
                              </DropdownMenuItem>
                            )}
                            {user.status === 'banni' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user)
                                  setDialogAction('unban')
                                }}
                              >
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                                Débannir
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setDialogAction('role')
                              }}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Changer le rôle
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setDialogAction('delete')
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-gray-500">
              {filteredUsers.length === 0
                ? "0 résultat"
                : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredUsers.length)} sur ${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''}`
              }
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
              >
                <span className="text-xs font-bold">«</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <span className="text-xs font-bold">‹</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  size="icon"
                  className={`h-8 w-8 text-xs ${page === safePage ? 'bg-[#3558A2] text-white hover:bg-[#3558A2]/90' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                <span className="text-xs font-bold">›</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
              >
                <span className="text-xs font-bold">»</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Add Admin/Moderateur */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un administrateur ou modérateur</DialogTitle>
            <DialogDescription>
              Créez un compte avec des droits d'administration
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-prenom">Prénom *</Label>
                <Input
                  id="add-prenom"
                  value={newUser.prenom}
                  onChange={(e) => setNewUser(prev => ({ ...prev, prenom: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-nom">Nom *</Label>
                <Input
                  id="add-nom"
                  value={newUser.nom}
                  onChange={(e) => setNewUser(prev => ({ ...prev, nom: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password">Mot de passe *</Label>
              <Input
                id="add-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-role">Rôle *</Label>
              <Select
                value={newUser.role}
                onValueChange={(v) => setNewUser(prev => ({ ...prev, role: v as UserRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderateur">Modérateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={isSubmitting}
              className="bg-[#3558A2] hover:bg-[#3558A2]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le compte'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Validate */}
      <Dialog open={dialogAction === 'validate'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le compte</DialogTitle>
            <DialogDescription>
              Voulez-vous valider le compte de {selectedUser?.email} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => selectedUser && handleStatusChange(selectedUser, 'actif')}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Valider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Ban */}
      <Dialog open={dialogAction === 'ban'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir l'utilisateur</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment bannir {selectedUser?.email} ? Cette action empêchera l'utilisateur de se connecter.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleStatusChange(selectedUser, 'banni')}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Bannir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Unban */}
      <Dialog open={dialogAction === 'unban'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Débannir l'utilisateur</DialogTitle>
            <DialogDescription>
              Voulez-vous réactiver le compte de {selectedUser?.email} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => selectedUser && handleStatusChange(selectedUser, 'actif')}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Débannir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Change Role */}
      <Dialog open={dialogAction === 'role'} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
            <DialogDescription>
              Sélectionnez le nouveau rôle pour {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Button
              variant={selectedUser?.role === 'alumni' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => selectedUser && handleRoleChange(selectedUser, 'alumni')}
              disabled={isSubmitting || selectedUser?.role === 'alumni'}
            >
              Alumni
            </Button>
            <Button
              variant={selectedUser?.role === 'moderateur' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => selectedUser && handleRoleChange(selectedUser, 'moderateur')}
              disabled={isSubmitting || selectedUser?.role === 'moderateur'}
            >
              Modérateur
            </Button>
            <Button
              variant={selectedUser?.role === 'admin' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => selectedUser && handleRoleChange(selectedUser, 'admin')}
              disabled={isSubmitting || selectedUser?.role === 'admin'}
            >
              Administrateur
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={dialogAction === 'delete'} onOpenChange={() => { setDialogAction(null); setDeleteError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer définitivement {selectedUser?.email} ? Cette action est irréversible et supprimera également son profil alumni.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); setDeleteError(null); }}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminWrapper>
  )
}
