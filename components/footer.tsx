import Link from "next/link"
import { Facebook, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#3558A2] text-white mt-0">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
          {/* About */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-2">France Alumni Connect</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Le réseau des anciens étudiants guinéens diplômés de France.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-2">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/a-propos" className="hover:text-[#f48988] transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/actualites" className="hover:text-[#f48988] transition-colors">
                  Actualités
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="hover:text-[#f48988] transition-colors">
                  Annuaire
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-2">Contacts</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Institut Français de Guinée</li>
              <li>Conakry, Guinée</li>
              <li>
                <a href="mailto:france.alumni@institutfrancais-guinee.fr" className="hover:text-[#f48988] transition-colors">
                  france.alumni@institutfrancais-guinee.fr
                </a>
              </li>
              <li>+224 611 45 45 85</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-2">Suivez-nous</h4>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/share/1EaGeQh1f8/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#f48988] transition-colors"
                aria-label="Suivez-nous sur Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/francealumnign/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#f48988] transition-colors"
                aria-label="Suivez-nous sur LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="mailto:france.alumni@institutfrancais-guinee.fr" 
                className="hover:text-[#f48988] transition-colors"
                aria-label="Envoyez-nous un email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Copyright - 5e colonne à droite */}
          <div className="md:text-right">
            <p className="text-sm text-white/80 leading-relaxed">&copy; 2025 France Alumni Connect. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
