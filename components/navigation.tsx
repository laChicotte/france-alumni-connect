"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, User, LogOut, Settings, Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "",
    nom: "",
    prenom: "",
    photo_url: ""
  })
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Vérifier l'état de connexion au chargement
    const authStatus = localStorage.getItem('isAuthenticated')
    const userData = localStorage.getItem('user')

    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true)
      const parsedUser = JSON.parse(userData)
      setUser({
        ...parsedUser,
        name: parsedUser.nom && parsedUser.prenom
          ? `${parsedUser.prenom} ${parsedUser.nom}`
          : parsedUser.name || '',
        avatar: parsedUser.photo_url || parsedUser.avatar || ''
      })
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser({ name: "", email: "", avatar: "", role: "", nom: "", prenom: "", photo_url: "" })
    router.push('/')
    window.location.reload()
  }

  // Vérifier si l'utilisateur est admin ou modérateur
  const isAdminOrModerator = user.role === 'admin' || user.role === 'moderateur'

  const navItems = [
    { href: "/a-propos", label: "à propos" },
    { href: "/actualites", label: "actualités" },
    { href: "https://talent-diaspora.fr/", label: "emploi" },
    { href: "/formation", label: "formation" },
    { href: "/annuaire", label: "annuaire" },
  ]

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-[#3558A2]/25 bg-white">
      <div className="w-full">
        <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/logo_alumni_bleu.png"
              alt="Institut Français - France Alumni"
              width={120}
              height={60}
              className="object-contain h-14 w-auto"
            />
            <span
              className="hidden text-2xl font-bold uppercase tracking-wide text-[#3558A2] md:block"
              style={{
                letterSpacing: '0.05em',
                textShadow: "1px 1px 0 #d9e3ff",
              }}
            >
              France Alumni Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              const isActive = item.href.startsWith("http") ? false : pathname.startsWith(item.href)
              const isExternal = item.href.startsWith("http")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={`text-base transition-colors ${
                    isActive ? "font-semibold text-[#3558A2]" : "font-medium text-[#3558A2]/85 hover:text-[#3558A2]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}

            {/* Bouton Admin - Visible uniquement pour admin/modérateur */}
            {isAuthenticated && isAdminOrModerator && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#3558A2] px-3 py-1 text-base font-semibold text-[#3558A2]"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}

            {/* User Profile */}
            <div className="ml-6">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-[#3558A2]/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar && user.avatar !== '/placeholder.svg' ? user.avatar : undefined} alt={user.name} />
                        <AvatarFallback className="bg-[#3558A2]/10 text-[#3558A2] text-xs font-bold">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'FA'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-[140] mt-2 w-56" align="end" sideOffset={8} forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          {user.role && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : user.role === 'moderateur'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-[#3558A2]/10 text-[#3558A2]'
                            }`}>
                              {user.role}
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Lien Admin dans le dropdown aussi */}
                    {isAdminOrModerator && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Administration</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/profil" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mon profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/parametres" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Se déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/connexion" aria-label="Se connecter">
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-[#3558A2] hover:bg-[#3558A2]/10 cursor-pointer">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-transparent text-[#3558A2]">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="mr-0 border border-[#3558A2]/40 text-[#3558A2] hover:bg-[#3558A2]/10 lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="m-3 grid grid-cols-2 gap-2 rounded-lg border border-[#3558A2]/20 bg-white p-2 lg:hidden">
            {navItems.map((item) => {
              const isActive = item.href.startsWith("http") ? false : pathname.startsWith(item.href)
              const isExternal = item.href.startsWith("http")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={`rounded-md border px-3 py-2 text-center text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-[#3558A2] bg-[#3558A2]/10 text-[#3558A2]"
                      : "border-[#3558A2]/30 text-[#3558A2] hover:bg-[#3558A2]/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}

            {/* Bouton Admin Mobile - Visible uniquement pour admin/modérateur */}
            {isAuthenticated && isAdminOrModerator && (
              <Link
                href="/admin"
                className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md border border-[#3558A2] px-3 py-2 text-center text-xs font-semibold text-[#3558A2]"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-5 w-5" />
                Administration
              </Link>
            )}

            {/* Mobile User Profile */}
            <div className="col-span-2 mt-1 border-t border-[#3558A2]/20 px-2 pt-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar && user.avatar !== '/placeholder.svg' ? user.avatar : undefined} alt={user.name} />
                      <AvatarFallback className="bg-[#3558A2]/10 text-[#3558A2] text-xs font-bold">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'FA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#3558A2]">{user.name}</p>
                        {user.role && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-red-500/20 text-red-200'
                              : user.role === 'moderateur'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-[#3558A2]/10 text-[#3558A2]'
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-[#3558A2]/85 hover:bg-[#3558A2]/10 hover:text-[#3558A2] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                    <Link
                      href="/parametres"
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-[#3558A2]/85 hover:bg-[#3558A2]/10 hover:text-[#3558A2] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-[#3558A2]/85 hover:bg-[#3558A2]/10 hover:text-[#3558A2] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#3558A2]/85 hover:bg-[#3558A2]/10 hover:text-[#3558A2] transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/connexion"
                  className="block cursor-pointer"
                  onClick={() => setIsOpen(false)}
                  aria-label="Se connecter"
                >
                  <Button variant="ghost" className="w-full justify-center border border-[#3558A2]/30 hover:bg-[#3558A2]/10 cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-transparent text-[#3558A2]">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
