export default function PolitiqueCookiesPage() {
  return (
    <div className="min-h-screen py-12">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-[#3558A2] sm:text-4xl">Politique de cookies</h1>
        <p className="mt-3 text-sm text-muted-foreground">Derniere mise a jour: 01/04/2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil lorsque vous visitez un site web.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">2. Cookies utilisés sur ce site</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Essentiels</strong> : requis pour la connexion, la sécurite et le bon fonctionnement.</li>
              <li><strong>Preferences</strong> : mémorisation de certains choix d&apos;interface.</li>
              <li><strong>Mesure d&apos;audience</strong> : statistiques de fréquentation (si acceptés).</li>
              <li><strong>Marketing</strong> : campagnes et attribution (si activés).</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">3. Gestion de votre consentement</h2>
            <p>
              Vous pouvez accepter, refuser ou personnaliser les cookies optionnels via le bandeau cookies. Les cookies essentiels restent actifs.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">4. Durée de conservation</h2>
            <p>
              Les choix de consentement sont conservés pour une durée limitée (jusqu&apos;à 180 jours) puis redemandés.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">5. Contact</h2>
            <p>
              Pour toute question, vous pouvez nous écrire à : france.alumni@institutfrancais-guinee.fr
            </p>
          </section>
        </div>
      </section>
    </div>
  )
}
