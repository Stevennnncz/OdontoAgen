import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, MoreVertical, CheckCircle, X, AlertCircle, Ban } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import supabase from "@/lib/supabase-client"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface Appointment {
  id: number,
  fecha: string,
  hora_inicio: string,
  hora_final: string,
  tipo: string,
  estado: "Pendiente" | "Completada" | "Cancelada",
  paciente?: { cedula: string; nombre: string; apellidos: string } | null,
  odontologo?: { cedula: string; nombre: string; apellidos: string } | null,
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
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null)
  const [completeForm, setCompleteForm] = useState({
    medicamentos: "",
    notas: "",
    fecha_asignacion: "",
    paciente: "",
    odontologo: "",
    cedula: "",
  })

  const filteredAppointments = appointments.filter((app) => {
    const searchMatch =
      searchTerm === "" ||
      (app.paciente && (
        app.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.paciente.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      (app.odontologo && (
        app.odontologo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.odontologo.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      app.fecha?.includes(searchTerm) ||
      app.id?.toString().includes(searchTerm)

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

  const handleOpenCompleteModal = (appointment: Appointment) => {
    setCompletingAppointment(appointment)
    setCompleteForm({
      medicamentos: "",
      notas: "",
      fecha_asignacion: new Date().toISOString().split("T")[0],
      paciente: appointment.paciente ? `${appointment.paciente.nombre} ${appointment.paciente.apellidos}` : "",
      odontologo: appointment.odontologo ? `${appointment.odontologo.nombre} ${appointment.odontologo.apellidos}` : "",
      cedula: appointment.paciente ? appointment.paciente.cedula : "",
    })
    setCompleteModalOpen(true)
  }

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




  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!completingAppointment) return

    // Inserta la información adicional en la tabla correspondiente (ajusta el nombre de la tabla y campos)
    
      console.log({
        
      medicamentos: completeForm.medicamentos,
        notas: completeForm.notas,
        fecha_asignacion: new Date().toISOString().split("T")[0],
        paciente: completingAppointment.paciente?.cedula,
        odontologo: completingAppointment.odontologo?.cedula

    })
    
    const { error: insertError } = await supabase
      .from("tratamiento") 

      .insert([{
        medicamentos: completeForm.medicamentos,
        notas: completeForm.notas,
        fecha_asignacion: completeForm.fecha_asignacion,
        paciente: completingAppointment.paciente?.cedula,
        odontologo: completingAppointment.odontologo?.cedula
      }])

    if (insertError) {
      toast({
        title: "Error",
        description: "No se pudo guardar la información de atención.",
        variant: "destructive",
      })
      return
    }

    // Marca la cita como completada
    await handleCompleteAppointment(completingAppointment.id)
    setCompleteModalOpen(false)
    setCompletingAppointment(null)
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

  const handleAbsentAppointment = async (id: number) => {
    const { error } = await supabase
      .from("citas")
      .update({ estado: "Ausente" })
      .eq("id", id)

    if (!error) {
      toast({
        title: "Cita ausente",
        description: "La cita ha sido marcada como ausente.",
      })
      if (typeof onStatusChange === "function") onStatusChange(id, "Ausente")
    } else {
      toast({
        title: "Error",
        description: "No se pudo marcar la cita como ausente.",
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
                      <Button size="sm" variant="outline" onClick={() => handleOpenCompleteModal(appointment)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleCancelAppointment(appointment.id)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAbsentAppointment(appointment.id)}>
                        <Ban className="h-4 w-4 mr-1" />
                        Ausente
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



      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Cita</DialogTitle>
            <DialogDescription>
              Ingresa la información de atención para completar la cita.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompleteSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Medicamentos</label>
              <Input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={completeForm.medicamentos}
                onChange={e => setCompleteForm(f => ({ ...f, medicamentos: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Notas</label>
              <Textarea
                className="w-full border rounded px-2 py-1"
                value={completeForm.notas}
                onChange={e => setCompleteForm(f => ({ ...f, notas: e.target.value }))}
              />
            </div>
            {/* Puedes agregar más campos si lo necesitas */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCompleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar y Completar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>





    </>
  )
}