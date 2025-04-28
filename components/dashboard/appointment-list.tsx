"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context/auth-context"
import { AlertCircle, Calendar, Clock, MoreVertical, CheckCircle, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface Appointment {
  id: string
  date: string
  time: string
  type: "urgent" | "revision" | "treatment"
  status: "pending" | "completed" | "cancelled"
  patientName?: string
  doctorName: string
}

interface AppointmentListProps {
  filter?: "upcoming" | "past" | "all"
  searchTerm?: string
  filterStatus?: string
  filterType?: string
}

export function AppointmentList({
  filter = "upcoming",
  searchTerm = "",
  filterStatus = "all",
  filterType = "all",
}: AppointmentListProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === "administrador" || user?.role === "asistente"

  // Simulated data - would come from API in real implementation
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          date: "2023-06-15",
          time: "10:00",
          type: "revision",
          status: "pending",
          patientName: isAdmin ? "Ana García" : undefined,
          doctorName: "Dr. Martínez",
        },
        {
          id: "2",
          date: "2023-06-20",
          time: "14:30",
          type: "treatment",
          status: "pending",
          patientName: isAdmin ? "Carlos López" : undefined,
          doctorName: "Dra. Rodríguez",
        },
        {
          id: "3",
          date: "2023-05-10",
          time: "09:00",
          type: "urgent",
          status: "completed",
          patientName: isAdmin ? "María Sánchez" : undefined,
          doctorName: "Dr. Martínez",
        },
        {
          id: "4",
          date: "2023-05-05",
          time: "11:30",
          type: "revision",
          status: "cancelled",
          patientName: isAdmin ? "Juan Pérez" : undefined,
          doctorName: "Dra. Rodríguez",
        },
      ]

      setAppointments(mockAppointments)
      setLoading(false)
    }, 1000)
  }, [isAdmin])

  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.map((app) => (app.id === id ? { ...app, status: "cancelled" } : app)))

    toast({
      title: "Cita cancelada",
      description: "La cita ha sido cancelada exitosamente.",
    })
  }

  const handleCompleteAppointment = (id: string) => {
    setAppointments(appointments.map((app) => (app.id === id ? { ...app, status: "completed" } : app)))

    toast({
      title: "Cita completada",
      description: "La cita ha sido marcada como completada.",
    })
  }

  const filteredAppointments = appointments.filter((app) => {
    // Filter by search term
    const searchMatch =
      searchTerm === "" ||
      (app.patientName && app.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.doctorName.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by status
    const statusMatch = filterStatus === "all" || app.status === filterStatus

    // Filter by type
    const typeMatch = filterType === "all" || app.type === filterType

    // Filter by upcoming/past
    const today = new Date()
    const appDate = new Date(app.date)
    const isUpcoming = appDate >= today
    const dateMatch = filter === "all" || (filter === "upcoming" && isUpcoming) || (filter === "past" && !isUpcoming)

    return searchMatch && statusMatch && typeMatch && dateMatch
  })

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case "urgent":
        return { label: "Urgente", variant: "destructive" as const }
      case "revision":
        return { label: "Revisión", variant: "outline" as const }
      case "treatment":
        return { label: "Tratamiento", variant: "default" as const }
      default:
        return { label: type, variant: "outline" as const }
    }
  }

  const getAppointmentStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pendiente", variant: "outline" as const }
      case "completed":
        return { label: "Completada", variant: "success" as const }
      case "cancelled":
        return { label: "Cancelada", variant: "destructive" as const }
      default:
        return { label: status, variant: "outline" as const }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (filteredAppointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay citas que mostrar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredAppointments.map((appointment) => {
        const typeInfo = getAppointmentTypeLabel(appointment.type)
        const statusInfo = getAppointmentStatusLabel(appointment.status)

        return (
          <Card key={appointment.id} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  <Badge variant={typeInfo.variant}>
                    {appointment.type === "urgent" && <AlertCircle className="h-3 w-3 mr-1" />}
                    {typeInfo.label}
                  </Badge>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="text-sm">
                  {isAdmin && appointment.patientName && (
                    <div>
                      Paciente: <span className="font-medium">{appointment.patientName}</span>
                    </div>
                  )}
                  <div>
                    Doctor: <span className="font-medium">{appointment.doctorName}</span>
                  </div>
                </div>

                {appointment.status === "pending" && (
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Button size="sm" variant="outline" onClick={() => handleCompleteAppointment(appointment.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleCancelAppointment(appointment.id)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                        <DropdownMenuItem>Reprogramar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

