"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Appointment {
  id: string
  date: string
  time: string
  type: "urgent" | "revision" | "treatment"
  doctorName: string
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

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
          doctorName: "Dr. Martínez",
        },
        {
          id: "2",
          date: "2023-06-20",
          time: "14:30",
          type: "treatment",
          doctorName: "Dra. Rodríguez",
        },
      ]

      setAppointments(mockAppointments)
      setLoading(false)
    }, 1000)
  }, [])

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tienes citas próximas</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/appointments/new">Agendar una cita</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const typeInfo = getAppointmentTypeLabel(appointment.type)

        return (
          <div
            key={appointment.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(appointment.date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.time}</span>
              </div>
              <div className="text-sm">
                Doctor: <span className="font-medium">{appointment.doctorName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={typeInfo.variant}>
                {appointment.type === "urgent" && <AlertCircle className="h-3 w-3 mr-1" />}
                {typeInfo.label}
              </Badge>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/appointments/${appointment.id}`}>Ver detalles</Link>
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

