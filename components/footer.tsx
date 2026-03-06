// import Link from "next/link"
// import { Facebook, Linkedin, Mail } from "lucide-react"

// export function Footer() {
//   return (
//     <footer className="bg-[#3558A2] text-white mt-0">
//       <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
//           {/* About */}
//           <div>
//             <h3 className="font-serif text-lg font-bold mb-2">France Alumni Connect</h3>
//             <p className="text-sm text-white/80 leading-relaxed">
//               Le réseau des anciens étudiants guinéens diplômés de France.
//             </p>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h4 className="font-semibold mb-2">Liens rapides</h4>
//             <ul className="space-y-2 text-sm">
//               <li>
//                 <Link href="/a-propos" className="hover:text-[#f48988] transition-colors">
//                   À propos
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/actualites" className="hover:text-[#f48988] transition-colors">
//                   Actualités
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/annuaire" className="hover:text-[#f48988] transition-colors">
//                   Annuaire
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Contact */}
//           <div>
//             <h4 className="font-semibold mb-2">Contacts</h4>
//             <ul className="space-y-2 text-sm text-white/80">
//               <li>Institut Français de Guinée</li>
//               <li>Conakry, Guinée</li>
//               <li>
//                 <a href="mailto:france.alumni@institutfrancais-guinee.fr" className="hover:text-[#f48988] transition-colors">
//                   france.alumni@institutfrancais-guinee.fr
//                 </a>
//               </li>
//               <li>+224 611 45 45 85</li>
//             </ul>
//           </div>

//           {/* Social */}
//           <div>
//             <h4 className="font-semibold mb-2">Suivez-nous</h4>
//             <div className="flex gap-4">
//               <a 
//                 href="https://www.facebook.com/share/1EaGeQh1f8/?mibextid=wwXIfr" 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="hover:text-[#f48988] transition-colors"
//                 aria-label="Suivez-nous sur Facebook"
//               >
//                 <Facebook className="h-5 w-5" />
//               </a>
//               <a 
//                 href="https://www.linkedin.com/company/francealumnign/" 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="hover:text-[#f48988] transition-colors"
//                 aria-label="Suivez-nous sur LinkedIn"
//               >
//                 <Linkedin className="h-5 w-5" />
//               </a>
//               <a 
//                 href="mailto:france.alumni@institutfrancais-guinee.fr" 
//                 className="hover:text-[#f48988] transition-colors"
//                 aria-label="Envoyez-nous un email"
//               >
//                 <Mail className="h-5 w-5" />
//               </a>
//             </div>
//           </div>

//           {/* Copyright - 5e colonne à droite */}
//           <div className="md:text-right">
//             <p className="text-sm text-white/80 leading-relaxed">&copy; 2025 France Alumni Connect. Tous droits réservés.</p>
//             <p className="mt-1 text-xs text-white/70">
//               Réalisé par{" "}
//               <a
//                 href="https://efficienceglobale.com/"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="underline underline-offset-2 hover:text-[#f48988] transition-colors"
//               >
//                 Efficience Globale
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }
import Link from "next/link"
import { Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#3558A2] text-white mt-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8 items-start">

          {/* Brand */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-3">France Alumni Connect</h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Le réseau des anciens étudiants guinéens diplômés de France.
            </p>
          </div>

          {/* Contact — colonne centrale plus large */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#f48988]" />
                <span>Institut Français de Guinée, Conakry, Guinée</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#f48988]" />
                <a
                  href="mailto:france.alumni@institutfrancais-guinee.fr"
                  className="hover:text-[#f48988] transition-colors whitespace-nowrap"
                >
                  france.alumni@institutfrancais-guinee.fr
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#f48988]" />
                <a href="tel:+22461145458" className="hover:text-[#f48988] transition-colors">
                  +224 611 45 45 85
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Suivez-nous</h4>
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
        <div className="border-t border-white/20 mt-2 pt-2 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/60">
          <p>&copy; 2025 France Alumni Connect. Tous droits réservés.</p>
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