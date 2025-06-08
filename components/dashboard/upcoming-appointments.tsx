"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertCircle, X } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"

interface Appointment {
  id: number
  fecha: string
  hora_inicio: string
  tipo: "urgent" | "revision" | "treatment" | string
  odontologo?: { nombre: string; apellidos: string } | null
  paciente?: { nombre: string; apellidos: string } | null
  estado?: string // <-- agrega esta línea
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const handleCancel = async (id: number) => {
    const { error } = await supabase
      .from("citas")
      .update({ estado: "Cancelada" })
      .eq("id", id)
    if (!error) {
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, estado: "Cancelada" } : app
        )
      )
      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada exitosamente.",
      })
      fetchUpcoming()
    } else {
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita.",
        variant: "destructive",
      })
    }
  }

  const fetchUpcoming = async () => {
    const today = new Date().toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("citas")
      .select(`
        id,
        fecha,
        hora_inicio,
        tipo,
        paciente:paciente (nombre, apellidos),
        odontologo:odontologo (nombre, apellidos)
      `)
      .gte("fecha", today)
      .eq("estado", "Pendiente")
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (!error && data) {
      const normalized = data
        .filter((item: any) => !!item.fecha)
        .slice(0, 3)
        .map((item: any) => ({
          ...item,
          odontologo: Array.isArray(item.odontologo)
            ? item.odontologo[0] || null
            : item.odontologo || null,
          paciente: Array.isArray(item.paciente)
            ? item.paciente[0] || null
            : item.paciente || null,
        }))
      setAppointments(normalized)
    } else {
      setAppointments([])
    }
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    fetchUpcoming()
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
        const typeInfo = getAppointmentTypeLabel(appointment.tipo)
        return (
          <div
            key={appointment.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {
                    (() => {
                      const [year, month, day] = appointment.fecha.split('-').map(Number)
                      const localDate = new Date(year, month - 1, day)
                      return localDate.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    })()
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.hora_inicio}</span>
              </div>
              <div className="text-sm">
                Doctor: <span className="font-medium">
                  {appointment.odontologo
                    ? `${appointment.odontologo.nombre} ${appointment.odontologo.apellidos}`
                    : "Sin asignar"}
                </span>
              </div>
              <div className="text-sm">
                Paciente: <span className="font-medium">
                  {appointment.paciente
                    ? `${appointment.paciente.nombre} ${appointment.paciente.apellidos}`
                    : "Sin asignar"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={typeInfo.variant}>
                {appointment.tipo === "urgent" && <AlertCircle className="h-3 w-3 mr-1" />}
                {typeInfo.label}
              </Badge>
              {/*appointment.estado !== "Cancelada" && (
              <Button
                size="sm"
                onClick={() => handleCancel(appointment.id)}
                className="flex items-center gap-2">
                <span className="font-semibold">Cancelar</span>
              </Button>
            )}*/}
            </div>
          </div>
        )
      })}
      <div className="flex justify-end">
        <Button asChild variant="link">
        </Button>
      </div>
    </div>
  )
}