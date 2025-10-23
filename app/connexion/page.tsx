"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConnexionPage() {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const testProfiles = [
    {
      id: "admin",
      name: "Administrateur",
      email: "admin@france-alumni-guinee.com",
      password: "admin123",
      role: "Administrateur",
      icon: Shield,
      color: "bg-red-500",
      description: "Accès complet à toutes les fonctionnalités"
    },
    {
      id: "alumni",
      name: "Fatoumata Diallo",
      email: "f.diallo@edutech-guinee.com",
      password: "alumni123",
      role: "Alumni",
      icon: User,
      color: "bg-[#0055A4]",
      description: "Accès membre standard"
    },
    {
      id: "moderator",
      name: "Mamadou Sylla",
      email: "m.sylla@gds.gn",
      password: "mod123",
      role: "Modérateur",
      icon: Users,
      color: "bg-green-500",
      description: "Accès modération et gestion"
    }
  ]

  const handleProfileSelect = (profile: typeof testProfiles[0]) => {
    setSelectedProfile(profile.id)
    // Remplir automatiquement les champs
    const emailInput = document.getElementById('email') as HTMLInputElement
    const passwordInput = document.getElementById('password') as HTMLInputElement
    if (emailInput && passwordInput) {
      emailInput.value = profile.email
      passwordInput.value = profile.password
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const emailInput = document.getElementById('email') as HTMLInputElement
    const passwordInput = document.getElementById('password') as HTMLInputElement
    
    if (!emailInput || !passwordInput) return

    const email = emailInput.value
    const password = passwordInput.value

    // Simuler une vérification des identifiants
    const profile = testProfiles.find(p => p.email === email && p.password === password)
    
    if (profile) {
      // Sauvegarder les données utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.id === 'alumni' ? '/african-woman-professional-portrait.png' : '/placeholder.svg'
      }))
      localStorage.setItem('isAuthenticated', 'true')
      
      // Rediriger vers la page d'accueil et forcer le rechargement
      router.push('/')
      // Forcer le rechargement pour mettre à jour l'état de navigation
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } else {
      alert('Identifiants incorrects')
    }
    
    setIsLoading(false)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#0055A4] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">FA</span>
          </div>
          <CardTitle className="font-serif text-2xl">Connexion</CardTitle>
          <CardDescription>Accédez à votre espace membre France Alumni Guinée</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input id="email" type="email" placeholder="votre@email.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/mot-de-passe-oublie" className="text-sm text-[#0055A4] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-[#0055A4] hover:bg-[#0055A4]/90" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Pas encore membre ?{" "}
              <Link href="/inscription" className="text-[#0055A4] font-semibold hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Profils de test */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Profils de test</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {testProfiles.map((profile) => {
                const IconComponent = profile.icon
                return (
                  <Button
                    key={profile.id}
                    variant={selectedProfile === profile.id ? "default" : "outline"}
                    className={`w-full justify-start p-4 h-auto ${
                      selectedProfile === profile.id 
                        ? "bg-[#0055A4] hover:bg-[#0055A4]/90" 
                        : "bg-transparent hover:bg-muted"
                    }`}
                    onClick={() => handleProfileSelect(profile)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-8 h-8 rounded-full ${profile.color} flex items-center justify-center`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{profile.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {profile.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{profile.description}</p>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800 text-center">
                <strong>Mode test :</strong> Cliquez sur un profil pour remplir automatiquement les champs de connexion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
