"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { User, AlumniProfile } from "@/types/database.types"

export default function ConnexionPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Connexion avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("Email ou mot de passe incorrect")
        } else if (authError.message === "Email not confirmed") {
          setError("Veuillez confirmer votre email avant de vous connecter")
        } else {
          setError(authError.message)
        }
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setError("Erreur de connexion")
        setIsLoading(false)
        return
      }

      // Récupérer les infos du user depuis notre table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError || !userData) {
        console.error('Erreur user:', userError)
        setError("Erreur lors de la récupération du profil")
        setIsLoading(false)
        return
      }

      const user = userData as User

      // Vérifier si le compte est actif
      if (user.status === 'en_attente') {
        setError("Votre compte est en attente de validation")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      if (user.status === 'banni') {
        setError("Votre compte a été suspendu")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      // Si c'est un alumni, récupérer son profil alumni
      let alumniProfile: AlumniProfile | null = null
      if (user.role === 'alumni') {
        const { data: profileData } = await supabase
          .from('alumni_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single()

        alumniProfile = profileData as AlumniProfile | null
      }

      // Sauvegarder les données utilisateur dans localStorage
      const userToStore = {
        id: user.id,
        email: user.email,
        nom: user.role === 'alumni' && alumniProfile ? alumniProfile.nom : user.nom,
        prenom: user.role === 'alumni' && alumniProfile ? alumniProfile.prenom : user.prenom,
        role: user.role,
        status: user.status,
        photo_url: user.role === 'alumni' && alumniProfile ? alumniProfile.photo_url : user.photo_url,
        alumniProfile: alumniProfile
      }

      localStorage.setItem('user', JSON.stringify(userToStore))
      localStorage.setItem('isAuthenticated', 'true')

      // Rediriger selon le rôle avec window.location pour forcer le rechargement
      if (user.role === 'admin' || user.role === 'moderateur') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }

    } catch (err) {
      console.error('Erreur:', err)
      setError("Une erreur est survenue. Veuillez réessayer.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#3558A2] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">FA</span>
          </div>
          <CardTitle className="font-serif text-2xl">Connexion</CardTitle>
          <CardDescription>Accédez à votre espace membre France Alumni Guinée</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/mot-de-passe-oublie" className="text-sm text-[#3558A2] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#3558A2] hover:bg-[#3558A2]/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Pas encore membre ?{" "}
              <Link href="/inscription" className="text-[#3558A2] font-semibold hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
