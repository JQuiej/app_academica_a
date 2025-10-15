// src/app/dashboard/DashboardNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Calendar, Calculator, Home, BarChart3, Search, Sparkles } from 'lucide-react'
import { SheetClose } from "@/components/ui/sheet"
import { CicloSelector } from './CicloSelector'
import { se } from 'date-fns/locale'

export function DashboardNav({ ciclos, isMobile = false }: { ciclos: any[], isMobile?: boolean }) {
  const pathname = usePathname()
  const navItems = [
    { href: "/dashboard/hoy", label: "Hoy", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/ciclos", label: "Mis Ciclos", icon: BookOpen },
    { href: "/dashboard/calendario", label: "Calendario", icon: Calendar },
    { href: "/dashboard/predictor", label: "Predictor", icon: Calculator },
    { href: "/dashboard/estadisticas", label: "Estadísticas", icon: BarChart3 },
    //{ href: "/dashboard/asistente", label: "Próximas Tareas", icon: BookOpen },
    { href: "/dashboard/buscador", label: "Buscador Web", icon: Search }, // Nuevo ícono y ruta
    //{ href: "/dashboard/iasistente", label: "Asistente IA", icon: Sparkles }, // Nuevo ícono y ruta
    { href: "/dashboard/asistente", label: "Asistente IA", icon: Sparkles }, // Nuevo ícono y ruta
  ]

  const LinkWrapper = isMobile ? SheetClose : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return (
    <>
      <div className="p-4 border-b md:border-b-0">
        <CicloSelector ciclos={ciclos} />
      </div>
      <nav className="flex flex-col gap-1 p-4 pt-2 md:pt-4 md:p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <LinkWrapper asChild key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm hover:bg-muted ${
                  isActive ? "bg-muted text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </LinkWrapper>
          )
        })}
      </nav>
    </>
  )
}