"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context/auth-context"
import { cn } from "@/lib/utils"
import {
  Activity as Icon,
  Calendar,
  Settings,
  Users,
  BarChart3,
  Menu,
  LogOut,
  Hospital,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      label: "Panel Principal",
      icon: BarChart3,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Citas",
      icon: Calendar,
      href: "/dashboard/appointments",
      active: pathname === "/dashboard/appointments" || pathname.startsWith("/dashboard/appointments/"),
    },
    {
      label: "Odontólogos",
      icon: Hospital,
      href: "/dashboard/doctors",
      active: pathname === "/dashboard/doctors",
    },
    {
      label: "Pacientes",
      icon: Users,
      href: "/dashboard/users",
      active: pathname === "/dashboard/users",
    },
    {
      label: "Configuración",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  const SidebarContent = (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Icon className="h-6 w-6 text-black" />
        <span className="text-black">Clínica Dental</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {routes.map((route, i) => (
            <Link key={i} href={route.href} onClick={() => setOpen(false)}>
              <Button
                variant={route.active ? "secondary" : "ghost"}
                className={`w-full justify-start ${route.active ? "text-white" : "text-black"} hover:text-white`}
              >
                <route.icon className="mr-2 h-5 w-5" />
                {route.label}
              </Button>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              logout()
              setOpen(false)
            }}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </nav>
      </ScrollArea>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 border-r bg-white lg:block">{SidebarContent}</aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden absolute left-4 top-3 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {SidebarContent}
        </SheetContent>
      </Sheet>
    </>
  )
}