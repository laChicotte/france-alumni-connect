import Link from "next/link"
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0055A4] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">France Alumni Connect</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Le réseau des anciens étudiants guinéens diplômés de France.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/a-propos" className="hover:text-[#FCD116] transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/actualites" className="hover:text-[#FCD116] transition-colors">
                  Actualités
                </Link>
              </li>
              <li>
                <Link href="/emploi" className="hover:text-[#FCD116] transition-colors">
                  Emploi
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="hover:text-[#FCD116] transition-colors">
                  Annuaire
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Institut Français de Guinée</li>
              <li>Conakry, Guinée</li>
              <li>contact@francealumniconnect.fr</li>
              <li>+224 XXX XX XX XX</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Suivez-nous</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#FCD116] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#FCD116] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#FCD116] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#FCD116] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-sm text-center text-white/80">
          <p>&copy; 2025 France Alumni Connect. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
