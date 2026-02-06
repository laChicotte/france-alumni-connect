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
import { Search, MoreHorizontal, Check, X, Shield, UserCog, Ban, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { User } from "@/types/database.types"

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogAction, setDialogAction] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', user.id)

    if (!error) {
      fetchUsers()
    }
    setIsSubmitting(false)
    setDialogAction(null)
    setSelectedUser(null)
  }

  const handleRoleChange = async (user: User, newRole: 'admin' | 'moderateur' | 'alumni') => {
    setIsSubmitting(true)
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', user.id)

    if (!error) {
      fetchUsers()
    }
    setIsSubmitting(false)
    setDialogAction(null)
    setSelectedUser(null)
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
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500">Gérez les comptes utilisateurs de la plateforme</p>
        </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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
            <Select value={filterRole} onValueChange={setFilterRole}>
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
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
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
      </div>
    </AdminWrapper>
  )
}
