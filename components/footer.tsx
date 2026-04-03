import Link from "next/link"
import { Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#3558A2] text-white mt-0 p-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr_auto] gap-8 items-start">

          {/* Brand + description */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-3">France Alumni Connect</h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Le réseau des Guinéens <br/> diplômés de France
            </p>
            <div className="mt-4 flex flex-col gap-1 text-xs text-white/60">
              <Link href="/mentions-legales" className="hover:text-[#f48988] transition-colors">Mentions légales</Link>
              <Link href="/conditions-utilisation" className="hover:text-[#f48988] transition-colors">Conditions d&apos;utilisation</Link>
              <Link href="/politique-cookies" className="hover:text-[#f48988] transition-colors">Politique de cookies</Link>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-bold text-sm tracking-wider mb-4">contacts</h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-white" />
                <a
                  href="https://maps.app.goo.gl/8kaEAzcEyiu3b89dA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f48988] transition-colors"
                >
                  Institut français de Guinée
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-white" />
                <a
                  href="mailto:france.alumni@institutfrancais-guinee.fr"
                  className="hover:text-[#f48988] transition-colors break-all"
                >
                  france.alumni@institutfrancais-guinee.fr
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-white" />
                <a href="tel:+224611454585" className="hover:text-[#f48988] transition-colors">
                  +224 611 45 45 85
                </a>
              </li>
            </ul>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-bold text-sm tracking-wider mb-4">liens rapides</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li><Link href="/annuaire" className="hover:text-[#f48988] transition-colors">annuaire</Link></li>
              <li><Link href="/actualites" className="hover:text-[#f48988] transition-colors">actualités</Link></li>
              <li><Link href="/evenements" className="hover:text-[#f48988] transition-colors">événements</Link></li>
              <li><Link href="/formation" className="hover:text-[#f48988] transition-colors">formation</Link></li>
              <li><Link href="https://talent-diaspora.fr/" className="hover:text-[#f48988] transition-colors">emploi</Link></li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h4 className="font-bold text-sm tracking-wider mb-4">suivez-nous</h4>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/share/1EaGeQh1f8/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-[#f48988] p-2 rounded-full transition-colors"
                aria-label="Suivez-nous sur Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/francealumnign/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-[#f48988] p-2 rounded-full transition-colors"
                aria-label="Suivez-nous sur LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:france.alumni@institutfrancais-guinee.fr"
                className="bg-white/10 hover:bg-[#f48988] p-2 rounded-full transition-colors"
                aria-label="Envoyez-nous un email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/20 mt-3 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/60">
          <p>&copy; 2026 France Alumni Connect. Tous droits réservés.</p>
          <p>
            Piloté par{" "}
            <a
              href="https://institutfrancais-guinee.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[#f48988] transition-colors"
            >
              l&apos;Institut français de Guinée
            </a>
          </p>
          <p>
            Réalisé par{" "}
            <a
              href="https://efficienceglobale.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[#f48988] transition-colors"
            >
              Efficience Globale
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}