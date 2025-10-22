import { CheckCircle, Shield, Clock, FileCheck, Upload, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function AuthenticationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0055A4] to-[#003d7a] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-balance">
              Authentification de Diplômes
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Vérifiez l'authenticité de vos diplômes français avec VérifDiploma, la solution officielle et sécurisée
              pour l'authentification des diplômes de l'enseignement supérieur français.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-[#0055A4] mb-4" />
                <CardTitle>Sécurisé et Officiel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  VérifDiploma est la solution officielle reconnue par le Ministère de l'Enseignement Supérieur
                  français.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-[#FCD116] mb-4" />
                <CardTitle>Rapide et Efficace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Obtenez votre attestation d'authenticité en 48 à 72 heures ouvrées après soumission complète.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-12 w-12 text-[#0055A4] mb-4" />
                <CardTitle>Reconnu Internationalement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Les attestations VérifDiploma sont acceptées par les employeurs et institutions du monde entier.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un processus simple en 4 étapes pour authentifier votre diplôme
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: Upload,
                title: "Soumettez votre demande",
                description: "Remplissez le formulaire et téléchargez une copie numérique de votre diplôme",
              },
              {
                step: "2",
                icon: Search,
                title: "Vérification",
                description: "Notre équipe vérifie l'authenticité auprès des établissements français",
              },
              {
                step: "3",
                icon: CheckCircle,
                title: "Validation",
                description: "Votre diplôme est authentifié et une attestation est générée",
              },
              {
                step: "4",
                icon: FileCheck,
                title: "Réception",
                description: "Recevez votre attestation officielle par email sous 48-72h",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-[#0055A4] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FCD116] text-[#0055A4] rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Form Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Formulaire de Vérification</CardTitle>
              <CardDescription>
                Remplissez ce formulaire pour soumettre votre demande d'authentification de diplôme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Informations Personnelles</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input id="firstName" placeholder="Votre prénom" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input id="lastName" placeholder="Votre nom" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="votre.email@exemple.com" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input id="phone" type="tel" placeholder="+224 XXX XXX XXX" required />
                    </div>
                  </div>
                </div>

                {/* Diploma Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Informations sur le Diplôme</h3>

                  <div className="space-y-2">
                    <Label htmlFor="diplomaType">Type de Diplôme *</Label>
                    <Select>
                      <SelectTrigger id="diplomaType">
                        <SelectValue placeholder="Sélectionnez le type de diplôme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="licence">Licence</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="doctorat">Doctorat</SelectItem>
                        <SelectItem value="ingenieur">Diplôme d'Ingénieur</SelectItem>
                        <SelectItem value="mba">MBA</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diplomaTitle">Intitulé du Diplôme *</Label>
                    <Input id="diplomaTitle" placeholder="Ex: Master en Finance d'Entreprise" required />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">Établissement *</Label>
                      <Input id="university" placeholder="Ex: Université Paris-Dauphine" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Année d'Obtention *</Label>
                      <Input id="graduationYear" type="number" placeholder="Ex: 2020" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diplomaNumber">Numéro du Diplôme (si disponible)</Label>
                    <Input id="diplomaNumber" placeholder="Numéro figurant sur le diplôme" />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Documents à Fournir</h3>

                  <div className="space-y-2">
                    <Label htmlFor="diplomaFile">Copie du Diplôme *</Label>
                    <Input id="diplomaFile" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                    <p className="text-sm text-muted-foreground">Format accepté: PDF, JPG, PNG (max 5 Mo)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idFile">Pièce d'Identité *</Label>
                    <Input id="idFile" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                    <p className="text-sm text-muted-foreground">Passeport ou carte d'identité</p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Informations Complémentaires</h3>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Motif de la Demande *</Label>
                    <Select>
                      <SelectTrigger id="purpose">
                        <SelectValue placeholder="Sélectionnez le motif" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emploi">Recherche d'emploi</SelectItem>
                        <SelectItem value="poursuite">Poursuite d'études</SelectItem>
                        <SelectItem value="immigration">Procédure d'immigration</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Commentaires (optionnel)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Informations supplémentaires ou demandes particulières"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Alert Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Important</p>
                    <p>
                      Assurez-vous que tous les documents sont lisibles et que les informations fournies correspondent
                      exactement à celles figurant sur votre diplôme. Toute erreur pourrait retarder le traitement de
                      votre demande.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" size="lg" className="bg-[#0055A4] hover:bg-[#003d7a]">
                    Soumettre la Demande
                  </Button>
                  <Button type="button" variant="outline" size="lg">
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Tarifs et Délais</h2>
            <p className="text-xl text-muted-foreground">Des tarifs transparents et compétitifs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Standard</CardTitle>
                <CardDescription>Délai: 5-7 jours ouvrés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">25€</span>
                  <span className="text-muted-foreground">/diplôme</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Vérification complète</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Attestation officielle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Support par email</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#0055A4] shadow-lg scale-105">
              <CardHeader>
                <div className="bg-[#0055A4] text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-2">
                  RECOMMANDÉ
                </div>
                <CardTitle>Express</CardTitle>
                <CardDescription>Délai: 48-72 heures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">45€</span>
                  <span className="text-muted-foreground">/diplôme</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Vérification prioritaire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Attestation officielle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Suivi en temps réel</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Urgent</CardTitle>
                <CardDescription>Délai: 24 heures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">75€</span>
                  <span className="text-muted-foreground">/diplôme</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Traitement immédiat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Attestation officielle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Support téléphonique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Suivi en temps réel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Garantie 24h</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Tarifs réduits disponibles pour les membres France Alumni Connect
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Questions Fréquentes</h2>
            <p className="text-xl text-muted-foreground">Tout ce que vous devez savoir sur l'authentification</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-lg px-6 border">
              <AccordionTrigger className="text-left font-semibold">Qu'est-ce que VérifDiploma ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                VérifDiploma est le service officiel d'authentification des diplômes de l'enseignement supérieur
                français. Il permet de vérifier l'authenticité d'un diplôme auprès des établissements émetteurs et de
                délivrer une attestation officielle reconnue internationalement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg px-6 border">
              <AccordionTrigger className="text-left font-semibold">
                Quels diplômes peuvent être vérifiés ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Tous les diplômes délivrés par les établissements d'enseignement supérieur français reconnus par l'État
                peuvent être vérifiés : Licence, Master, Doctorat, diplômes d'ingénieur, diplômes de grandes écoles,
                etc. Les diplômes doivent avoir été obtenus après 1990.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg px-6 border">
              <AccordionTrigger className="text-left font-semibold">
                Combien de temps prend la vérification ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Le délai dépend de la formule choisie : Standard (5-7 jours), Express (48-72h), ou Urgent (24h). Ces
                délais sont comptés en jours ouvrés à partir de la réception d'un dossier complet. Vous recevrez des
                notifications par email à chaque étape du processus.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg px-6 border">
              <AccordionTrigger className="text-left font-semibold">Quels documents dois-je fournir ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Vous devez fournir une copie numérique claire de votre diplôme (PDF, JPG ou PNG) et une copie de votre
                pièce d'identité (passeport ou carte d'identité). Assurez-vous que tous les textes sont lisibles et que
                les informations correspondent exactement à celles de vos documents originaux.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg px-6 border">
              <AccordionTrigger className="text-left font-semibold">
                L'attestation est-elle reconnue internationalement ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Oui, les attestations VérifDiploma sont reconnues et acceptées par les employeurs, les institutions
                académiques et les administrations du monde entier. L'attestation est délivrée en français et en
                anglais, avec un QR code permettant de vérifier son authenticité en ligne.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-lg px-6 border">
              <AccordionTrigger className="text-left font-semibold">
                Que se passe-t-il si mon diplôme ne peut pas être vérifié ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Si nous ne parvenons pas à vérifier votre diplôme (établissement non reconnu, informations incohérentes,
                etc.), nous vous contacterons pour clarifier la situation. Si la vérification s'avère impossible, vous
                serez intégralement remboursé. Nous vous fournirons également des explications détaillées sur les
                raisons de l'échec de la vérification.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-white rounded-lg px-6 border">
              <AccordionTrigger className="text-left font-semibold">
                Comment puis-je suivre ma demande ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Après avoir soumis votre demande, vous recevrez un numéro de suivi par email. Vous pourrez suivre
                l'avancement de votre dossier en temps réel via notre plateforme. Vous recevrez également des
                notifications automatiques à chaque étape : réception, vérification en cours, validation, et envoi de
                l'attestation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-white rounded-lg px-6 border">
              <AccordionTrigger className="text-left font-semibold">
                Y a-t-il des réductions pour les membres France Alumni ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Oui ! Les membres actifs de France Alumni Connect bénéficient d'une réduction de 20% sur tous les
                services d'authentification. Pour en bénéficier, connectez-vous à votre compte membre avant de soumettre
                votre demande, ou indiquez votre numéro de membre dans le formulaire.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#0055A4] to-[#003d7a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Besoin d'aide ?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Notre équipe est disponible pour répondre à toutes vos questions sur le processus d'authentification
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-[#0055A4] hover:bg-gray-100">
              Contacter le Support
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              Consulter le Guide Complet
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
