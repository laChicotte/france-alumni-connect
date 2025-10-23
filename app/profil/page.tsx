"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Building, GraduationCap, Edit2, Save, X } from "lucide-react"

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const authStatus = localStorage.getItem('isAuthenticated')
    const userData = localStorage.getItem('user')
    
    if (authStatus !== 'true' || !userData) {
      router.push('/connexion')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Données de profil étendues (simulées)
    const extendedProfile = {
      ...parsedUser,
      phone: "+224 123 45 67 89",
      location: "Conakry, Guinée",
      company: parsedUser.role === "Alumni" ? "EduTech Guinée" : "France Alumni Guinée",
      position: parsedUser.role === "Alumni" ? "CEO & Fondatrice" : parsedUser.role,
      university: "Sciences Po Paris",
      graduation: "2020",
      degree: "Master en Politiques Publiques",
      bio: "Passionnée par l'éducation et l'innovation, je contribue au développement de solutions technologiques pour l'éducation en Guinée."
    }
    
    setFormData(extendedProfile)
  }, [router])

  const handleSave = () => {
    // Sauvegarder les modifications dans localStorage
    localStorage.setItem('user', JSON.stringify(formData))
    setUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(user)
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et professionnelles</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={formData.avatar && formData.avatar !== '/placeholder.svg' ? formData.avatar : undefined} alt={formData.name} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white text-xl font-bold">
                      {formData.name ? formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'FA'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-serif text-xl font-bold mb-1">{formData.name}</h2>
                  <Badge className="bg-[#0055A4] hover:bg-[#0055A4]/90">
                    {formData.role}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#0055A4]" />
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#0055A4]" />
                    <span>{formData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#0055A4]" />
                    <span>{formData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-[#0055A4]" />
                    <span>{formData.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#0055A4]" />
                    <span>{formData.university}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informations personnelles</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button size="sm" onClick={handleSave} className="bg-[#0055A4] hover:bg-[#0055A4]/90">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="mb-0.5 block">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-0.5 block">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="mb-0.5 block">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="mb-0.5 block">Localisation</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company" className="mb-0.5 block">Entreprise</Label>
                    <Input
                      id="company"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position" className="mb-0.5 block">Poste</Label>
                    <Input
                      id="position"
                      value={formData.position || ''}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="university" className="mb-0.5 block">Université</Label>
                    <Input
                      id="university"
                      value={formData.university || ''}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduation" className="mb-0.5 block">Année de diplôme</Label>
                    <Input
                      id="graduation"
                      value={formData.graduation || ''}
                      onChange={(e) => setFormData({...formData, graduation: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="degree" className="mb-0.5 block">Formation</Label>
                  <Input
                    id="degree"
                    value={formData.degree || ''}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="mb-0.5 block">Biographie</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Parlez-nous de votre parcours et de vos objectifs..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
