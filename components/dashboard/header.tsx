"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Settings, User, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context/auth-context"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const {user, logout } = useAuth()
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Tu cita ha sido confirmada", read: false },
    { id: 2, text: "Recordatorio: Cita mañana a las 10:00", read: false },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }



  const getRoleName = () => {
    switch (user?.role) {
      case "estudiante":
        return "Estudiante"
      case "asistente":
        return "Asistente"
      case "administrador":
        return "Administrador"
      default:
        return "Usuario"
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <div className="ml-auto flex items-center gap-4">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full ">
           <User className="h-5 w-5 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" >
            <DropdownMenuLabel>
            </DropdownMenuLabel>
          
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

