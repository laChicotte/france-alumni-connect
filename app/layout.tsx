import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CookieBanner } from "@/components/cookie-banner"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "France Alumni Connect",
  description: "Le réseau des anciens étudiants guinéens diplômés de France",
  icons: {
    icon: "/logo/iconweb.png",
    shortcut: "/logo/iconweb.png",
    apple: "/logo/iconweb.png",
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-marianne">
        <Navigation />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
