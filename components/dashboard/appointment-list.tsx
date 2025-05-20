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
  id: number,
  fecha: Date,
  hora_inicio: string,
  hora_final: string,
  tipo: string,
  estado: "Pendiente" | "Completada" | "Cancelada",
  paciente?: { nombre: string; apellidos: string } | null,
  odontologo?: { nombre: string; apellidos: string } | null,
  emergencia?: string,
  duracion?: boolean,
}

interface AppointmentListProps {
  appointments: Appointment[]
  filter?: "upcoming" | "past" | "all"
  searchTerm?: string
  filterStatus?: string
  filterType?: string
}

export function AppointmentList({
  appointments,
  filter = "upcoming",
  searchTerm = "",
  filterStatus = "all",
  filterType = "all",
}: AppointmentListProps) {
  const { toast } = useToast()

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay citas que mostrar</p>
      </div>
    )
  }
  // Simulated data - would come from API in real implementation


  const handleCancelAppointment = (id: string) => {
    

    toast({
      title: "Cita cancelada",
      description: "La cita ha sido cancelada exitosamente.",
    })
  }

  const handleCompleteAppointment = (id: string) => {
    

    toast({
      title: "Cita completada",
      description: "La cita ha sido marcada como completada.",
    })
  }

  const filteredAppointments = appointments.filter((app) => {
    // Filter by search term
    const searchMatch =
      searchTerm === "" ||
      (app.paciente && app.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.odontologo?.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by status
    const statusMatch = filterStatus === "all" || app.estado === filterStatus

    // Filter by type
    const typeMatch = filterType === "all" || app.tipo === filterType

    // Filter by upcoming/past
    const today = new Date()
    const appDate = new Date(app.fecha)
    const isUpcoming = appDate >= today
    const dateMatch = filter === "all" || (filter === "upcoming" && isUpcoming) || (filter === "past" && !isUpcoming)

    return searchMatch && statusMatch && typeMatch && dateMatch
  })

  const getAppointmentTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "urgent":
        return { label: "Urgente", variant: "destructive" as const }
      case "revision":
        return { label: "Revisión", variant: "outline" as const }
      case "treatment":
        return { label: "Tratamiento", variant: "default" as const }
      default:
        return { label: tipo, variant: "outline" as const }
    }
  }

  const getAppointmentStatusLabel = (estado: string) => {
    switch (estado) {
      case "pending":
        return { label: "Pendiente", variant: "outline" as const }
      case "completed":
        return { label: "Completada", variant: "default" as const }
      case "cancelled":
        return { label: "Cancelada", variant: "destructive" as const }
      default:
        return { label: estado, variant: "outline" as const }
    }
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
        const typeInfo = getAppointmentTypeLabel(appointment.tipo)
        const statusInfo = getAppointmentStatusLabel(appointment.estado)

        return (
          <Card key={appointment.id} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {new Date(appointment.fecha).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{appointment.hora_inicio} - {appointment.hora_final}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  <Badge variant={typeInfo.variant}>
                    {appointment.tipo === "urgent" && <AlertCircle className="h-3 w-3 mr-1" />}
                    {typeInfo.label}
                  </Badge>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="text-sm">
                    <div>
                      Paciente: <span className="font-medium">  {appointment.paciente
                      ? `${appointment.paciente.nombre} ${appointment.paciente.apellidos}`
                      : "Desconocido"}</span>
                    </div>
                  
                  <div>
                    Doctor: <span className="font-medium">{appointment.odontologo?.nombre} {appointment.odontologo?.apellidos}</span>
                  </div>
                </div>

                {appointment.estado == "Pendiente" && (
                  <div className="flex gap-2">
                    
                      <Button size="sm" variant="outline" onClick={() => handleCompleteAppointment(String(appointment.id))}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    
                    <Button size="sm" variant="outline" onClick={() => handleCancelAppointment(String(appointment.id))}>
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

