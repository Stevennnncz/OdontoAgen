import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, MoreVertical, CheckCircle, X, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import supabase from "@/lib/supabase-client"

interface Appointment {
  id: number,
  fecha: string,
  hora_inicio: string,
  hora_final: string,
  tipo: string,
  estado: "Pendiente" | "Completada" | "Cancelada",
  paciente?: { nombre: string; apellidos: string } | null,
  odontologo?: { nombre: string; apellidos: string } | null,
  emergencia?: string,
  duracion?: boolean,
  notas?: string | null
}

interface AppointmentListProps {
  appointments: Appointment[]
  filter?: "upcoming" | "past" | "all"
  searchTerm?: string
  filterStatus?: string
  filterType?: string
  onStatusChange?: (id: number, newStatus: string) => void
}

export function AppointmentList({
  appointments,
  filter = "upcoming",
  searchTerm = "",
  filterStatus = "all",
  filterType = "all",
  onStatusChange,
}: AppointmentListProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const filteredAppointments = appointments.filter((app) => {
    const searchMatch =
      searchTerm === "" ||
      (app.paciente && app.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.odontologo?.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    const statusMatch = filterStatus === "all" || app.estado === filterStatus
    const typeMatch = filterType === "all" || app.tipo === filterType

    const today = new Date()
    const [year, month, day] = String(app.fecha).split('-')
    const appDate = new Date(Number(year), Number(month) - 1, Number(day))
    const isUpcoming = appDate >= today
    const isPast = appDate < today
    const dateMatch = filter === "all" || (filter === "upcoming" && isUpcoming) || (filter === "past" && isPast)

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
      case "Pendiente":
        return { label: "Pendiente", variant: "outline" as const }
      case "Completada":
        return { label: "Completada", variant: "default" as const }
      case "Cancelada":
        return { label: "Cancelada", variant: "destructive" as const }
      default:
        return { label: estado, variant: "outline" as const }
    }
  }

const handleCancelAppointment = async (id: number) => {
  const { error, data } = await supabase
    .from("citas")
    .update({ estado: "Cancelada" })
    .eq("id", id)
    .select("id, paciente (correo, nombre, apellidos), fecha, hora_inicio, hora_final")
    .single()

  if (!error) {
    // Llama a la API para enviar el correo
    if (data && data.paciente) {
      const paciente = Array.isArray(data.paciente) ? data.paciente[0] : data.paciente
      
      if (paciente?.correo) {
      await fetch("/api/cancel-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: paciente.correo,
          nombre: paciente.nombre,
          apellidos: paciente.apellidos,
          fecha: data.fecha,
          hora_inicio: data.hora_inicio,
          hora_final: data.hora_final,
        }),
      })
    }
    }
    toast({
      title: "Cita cancelada",
      description: "La cita ha sido cancelada exitosamente y se notificó al paciente.",
    })
    if (typeof onStatusChange === "function") onStatusChange(id, "Cancelada")
  } else {
    toast({
      title: "Error",
      description: "No se pudo cancelar la cita.",
      variant: "destructive",
    })
  }
}

  const handleCompleteAppointment = async (id: number) => {
    const { error } = await supabase
      .from("citas")
      .update({ estado: "Completada" })
      .eq("id", id)

    if (!error) {
      toast({
        title: "Cita completada",
        description: "La cita ha sido marcada como completada.",
      })
      if (typeof onStatusChange === "function") onStatusChange(id, "Completada")
    } else {
      toast({
        title: "Error",
        description: "No se pudo completar la cita.",
        variant: "destructive",
      })
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
    <>
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
                      {(() => {
                        const [year, month, day] = String(appointment.fecha).split('-')
                        const localDate = new Date(Number(year), Number(month) - 1, Number(day))
                        return localDate.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      })()}
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
                      Paciente: <span className="font-medium">
                        {appointment.paciente
                          ? `${appointment.paciente.nombre} ${appointment.paciente.apellidos}`
                          : "Desconocido"}
                      </span>
                    </div>
                    <div>
                      Doctor: <span className="font-medium">
                        {appointment.odontologo
                          ? `${appointment.odontologo.nombre} ${appointment.odontologo.apellidos}`
                          : "Desconocido"}
                      </span>
                    </div>
                  </div>

                  {appointment.estado === "Pendiente" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCompleteAppointment(appointment.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setOpen(true)
                            }}
                          >
                            Ver detalles
                          </DropdownMenuItem>
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

      {/* MODAL DE DETALLES */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la cita</DialogTitle>
            <DialogDescription>
              {selectedAppointment ? (
                <span>
                  <strong>Notas:</strong> {selectedAppointment.notas || "Sin notas"}
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}