"use client"

import Link from "next/link"
import Image from "next/image"
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
    { href: "/a-propos", label: "à propos" },
    { href: "/actualites", label: "actualités" },
    { href: "/emploi", label: "emploi" },
    { href: "/annuaire", label: "annuaire" },
  ]

  return (
    <nav className="bg-[#3558A2] border-b border-[#2a4680] sticky top-0 z-50">
      <div className="w-full">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 pl-2 sm:pl-4">
            <Image
              src="/logo/logo.png"
              alt="Institut Français - France Alumni"
              width={120}
              height={60}
              className="object-contain h-14 w-auto"
            />
            <span
              className="text-white font-bold text-2xl uppercase tracking-wide hidden sm:block"
              style={{
                letterSpacing: '0.05em',
                textShadow: `
                  2px 2px 0 #E85D3A,
                  3px 3px 0 #E85D3A,
                  4px 4px 0 #D94A2A,
                  5px 5px 0 #C93820
                `
              }}
            >
              France Alumni Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 pr-6">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    `px-3 py-2 text-base font-normal transition-colors ` +
                    (isActive
                      ? `text-white font-semibold border-b-2 border-white`
                      : `text-white/90 hover:text-white hover:border-b-2 hover:border-white/50`)
                  }
                >
                  {item.label}
                </Link>
              )
            })}
            
            {/* User Profile */}
            <div className="ml-6">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
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
                <Link href="/connexion">
                  <Button
                    size="sm"
                    className="bg-white text-[#3558A2] hover:bg-white/90 font-normal px-6 py-2 rounded-md"
                  >
                    se connecter
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 mr-4" onClick={() => setIsOpen(!isOpen)}>
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
                    `block px-4 py-3 text-base transition-colors ` +
                    (isActive
                      ? `text-white font-semibold bg-white/10`
                      : `text-white/90 hover:text-white hover:bg-white/5`)
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
            
            {/* Mobile User Profile */}
            <div className="px-4 py-2 border-t border-white/20 mt-4">
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
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-white/70">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 px-2 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                    <Link
                      href="/parametres"
                      className="flex items-center gap-2 px-2 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Paramètres
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex items-center gap-2 px-2 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 rounded-md transition-colors"
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
                      className="flex items-center gap-2 px-2 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 rounded-md transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/connexion" className="block" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full bg-white text-[#3558A2] hover:bg-white/90">
                      se connecter
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
