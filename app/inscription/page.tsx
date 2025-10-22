import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function InscriptionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#0055A4] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">FA</span>
          </div>
          <CardTitle className="font-serif text-2xl">Rejoignez France Alumni Guinée</CardTitle>
          <CardDescription>Créez votre compte pour accéder au réseau et à toutes ses opportunités</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input id="prenom" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email *</Label>
              <Input id="email" type="email" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe *</Label>
                <Input id="confirm-password" type="password" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">Université française *</Label>
              <Input id="university" placeholder="Ex: Sciences Po Paris" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formation">Formation / Diplôme *</Label>
                <Input id="formation" placeholder="Ex: Master en Politiques Publiques" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotion">Année de promotion *</Label>
                <Input id="promotion" type="number" placeholder="Ex: 2020" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-position">Poste actuel</Label>
              <Input id="current-position" placeholder="Ex: Consultant en Finance" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Entreprise / Organisation</Label>
              <Input id="company" placeholder="Ex: Banque Atlantique Guinée" />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                J'accepte les{" "}
                <Link href="/conditions" className="text-[#0055A4] hover:underline">
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/confidentialite" className="text-[#0055A4] hover:underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="newsletter" />
              <label htmlFor="newsletter" className="text-sm text-muted-foreground leading-relaxed">
                Je souhaite recevoir la newsletter et les actualités du réseau France Alumni Guinée
              </label>
            </div>

            <Button type="submit" className="w-full bg-[#0055A4] hover:bg-[#0055A4]/90" size="lg">
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link href="/connexion" className="text-[#0055A4] font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
