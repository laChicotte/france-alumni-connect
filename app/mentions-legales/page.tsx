export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen py-12">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-[#3558A2] sm:text-4xl">Mentions légales</h1>
        <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : 03/04/2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">1. Éditeur du site</h2>
            <p><strong>Nom :</strong> Institut français de Guinée</p>
            <p className="mt-1"><strong>Adresse :</strong> Pont du 8 Novembre, Kaloum, Conakry, Guinée</p>
            <p className="mt-1"><strong>Email :</strong>{" "}
              <a href="mailto:comifg@institutfrancais-guinee.fr" className="text-[#3558A2] hover:underline">
                comifg@institutfrancais-guinee.fr
              </a>
            </p>
            <p className="mt-1"><strong>Directeur de la publication :</strong> M. Sébastien VITTET, Directeur de l&apos;Institut français de Guinée</p>
            <p className="mt-2 text-muted-foreground italic">Statut juridique : en cours de définition.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">2. Hébergement</h2>
            <p>
              Le site est hébergé par <strong>Vercel Inc.</strong>, plateforme de type PaaS (Plateforme as a Service),
              dont le siège social est situé aux États-Unis.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">3. Données personnelles</h2>
            <p>
              Les informations collectées via ce site sont utilisées uniquement dans le cadre de la mise en relation
              des membres de la communauté entre eux et avec d&apos;autres professionnels, et dans la perspective
              d&apos;établir une base statistique fiable du réseau France Alumni Guinée et de l&apos;équipe France.
            </p>
            <p className="mt-2">
              Conformément à la réglementation en vigueur, vous disposez d&apos;un droit d&apos;accès, de modification
              et de suppression de vos données. Pour exercer ces droits, contactez-nous à :{" "}
              <a href="mailto:comifg@institutfrancais-guinee.fr" className="text-[#3558A2] hover:underline">
                comifg@institutfrancais-guinee.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">4. Cookies</h2>
            <p>
              Ce site utilise des cookies nécessaires à son fonctionnement et à l&apos;analyse d&apos;audience.
              Un dispositif permet à l&apos;utilisateur d&apos;accepter ou de refuser ces cookies conformément
              à la réglementation. Pour en savoir plus, consultez notre{" "}
              <a href="/politique-cookies" className="text-[#3558A2] hover:underline">
                politique de cookies
              </a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">5. Propriété intellectuelle</h2>
            <p>
              Tous les contenus présents sur ce site (textes, images, graphismes, logos) sont protégés et ne peuvent
              être reproduits sans autorisation préalable de l&apos;éditeur.
            </p>
            <p className="mt-2">
              Pour toute demande d&apos;autorisation :{" "}
              <a href="mailto:comifg@institutfrancais-guinee.fr" className="text-[#3558A2] hover:underline">
                comifg@institutfrancais-guinee.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">6. Responsabilité</h2>
            <p>
              L&apos;éditeur ne saurait être tenu responsable des erreurs ou omissions présentes sur le site.
              La responsabilité éditoriale revient au Directeur de l&apos;Institut français de Guinée,
              M. Sébastien VITTET.
            </p>
            <p className="mt-2">
              Pour signaler toute erreur :{" "}
              <a href="mailto:comifg@institutfrancais-guinee.fr" className="text-[#3558A2] hover:underline">
                comifg@institutfrancais-guinee.fr
              </a>
            </p>
          </section>

        </div>
      </section>
    </div>
  )
}
