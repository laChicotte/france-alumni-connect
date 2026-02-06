"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Briefcase,
  Calendar,
  Handshake,
  Settings,
  ChevronDown,
  Menu,
  X,
  Building,
  Tags,
  FolderCog,
  CalendarCog
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  children?: { href: string; label: string; icon: React.ElementType }[]
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/alumni", label: "Alumni", icon: GraduationCap },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/emplois", label: "Emplois", icon: Briefcase },
  { href: "/admin/evenements", label: "Événements", icon: Calendar },
  { href: "/admin/partenaires", label: "Partenaires", icon: Handshake },
  {
    href: "/admin/config",
    label: "Configuration",
    icon: Settings,
    children: [
      { href: "/admin/config/secteurs", label: "Secteurs", icon: Building },
      { href: "/admin/config/statuts-professionnels", label: "Statuts professionnels", icon: Tags },
      { href: "/admin/config/categories-articles", label: "Catégories articles", icon: FolderCog },
      { href: "/admin/config/types-evenements", label: "Types événements", icon: CalendarCog },
    ],
  },
]

interface AdminWrapperProps {
  children: React.ReactNode
}

export function AdminWrapper({ children }: AdminWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (pathname.startsWith('/admin/config')) {
      setConfigOpen(true)
    }
  }, [pathname])

  const checkAuth = async () => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      router.push('/connexion')
      return
    }

    const userData = JSON.parse(storedUser)

    if (userData.role !== 'admin' && userData.role !== 'moderateur') {
      router.push('/')
      return
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3558A2]"></div>
      </div>
    )
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
          <CollapsibleTrigger asChild>
            <button
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                pathname.startsWith('/admin/config')
                  ? 'bg-[#3558A2] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${configOpen ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 mt-1 space-y-1">
            {item.children?.map((child) => {
              const isChildActive = pathname === child.href
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isChildActive
                      ? 'bg-[#3558A2]/10 text-[#3558A2] font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <child.icon className="h-4 w-4" />
                  <span className="text-sm">{child.label}</span>
                </Link>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive
            ? 'bg-[#3558A2] text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <item.icon className="h-5 w-5" />
        <span className="font-medium text-sm">{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50">
      <div className="px-14 sm:px-16 py-4">

        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-start"
          >
            {sidebarOpen ? <X className="h-5 w-5 mr-2" /> : <Menu className="h-5 w-5 mr-2" />}
            Menu Administration
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`
            ${sidebarOpen ? 'block' : 'hidden'} lg:block
            w-full lg:w-64 flex-shrink-0
          `}>
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h2 className="font-bold text-lg text-gray-900 mb-4 px-3">Administration</h2>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className={`flex-1 min-w-0 ${sidebarOpen ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-lg shadow">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
