"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, User, LogOut, Settings, Bell } from "lucide-react"
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

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    role: ""
  })
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Vérifier l'état de connexion au chargement
    const authStatus = localStorage.getItem('isAuthenticated')
    const userData = localStorage.getItem('user')
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser({ name: "", email: "", avatar: "", role: "" })
    router.push('/')
  }

  const navItems = [
    // { href: "/", label: "Accueil" },
    { href: "/a-propos", label: "À propos" },
    { href: "/actualites", label: "Actualités" },
    { href: "/annuaire", label: "Annuaire" },
  ]

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3558A2] to-[#FCD116] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">FA</span>
            </div>
            <span className="font-serif text-xl font-bold text-foreground hidden sm:block">France Alumni Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    `px-4 py-2 text-sm font-medium rounded-md transition-colors ` +
                    (isActive
                      ? `text-[#3558A2] bg-[#3558A2]/10 border border-[#3558A2]/20`
                      : `text-foreground hover:text-[#3558A2] hover:bg-muted`)
                  }
                >
                  {item.label}
                </Link>
              )
            })}
            
            {/* User Profile */}
            <div className="ml-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar && user.avatar !== '/placeholder.svg' ? user.avatar : undefined} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white text-xs font-bold">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'FA'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          {user.role && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#3558A2]/10 text-[#3558A2]">
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
                <div className="flex items-center gap-2">
                  <Link href="/connexion">
                    <Button variant="outline" size="sm">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/inscription">
                    <Button size="sm" className="bg-[#3558A2] hover:bg-[#3558A2]/90">
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    `block px-4 py-2 text-sm font-medium rounded-md transition-colors ` +
                    (isActive
                      ? `text-[#3558A2] bg-[#3558A2]/10 border border-[#3558A2]/20`
                      : `text-foreground hover:text-[#3558A2] hover:bg-muted`)
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
            
            {/* Mobile User Profile */}
            <div className="px-4 py-2 border-t border-border mt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar && user.avatar !== '/placeholder.svg' ? user.avatar : undefined} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white text-xs font-bold">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'FA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:text-[#3558A2] hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                    <Link
                      href="/parametres"
                      className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:text-[#3558A2] hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:text-[#3558A2] hover:bg-muted rounded-md transition-colors"
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
                      className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:text-[#3558A2] hover:bg-muted rounded-md transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/connexion" className="block" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/inscription" className="block" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full bg-[#3558A2] hover:bg-[#3558A2]/90">
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
