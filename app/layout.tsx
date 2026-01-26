import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "France Alumni Connect - Réseau des Alumni Guinée",
  description: "Le réseau des anciens étudiants guinéens diplômés de France",
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
      </body>
    </html>
  )
}
