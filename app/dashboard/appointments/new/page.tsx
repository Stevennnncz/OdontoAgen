"use client"

import type React from "react"
import supabase from "@/lib/supabase-client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context/auth-context"
import { CalendarClock,AlertCircle, ShieldCheck, Stethoscope } from "lucide-react"

export default function NewAppointmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointmentType, setAppointmentType] = useState("revision")
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [showTimeSlotError, setShowTimeSlotError] = useState(false)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<{ cedula: number; nombre: string; apellidos: string }[]>([])
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [odont, setOdont] = useState<{ cedula: number; nombre: string; apellidos: string }[]>([])
  const [selectedOdont, setSelectedOdont] = useState<number | null>(null)
  const [loadingOdont, setLoadingOdont] = useState(true)
  const [busySlots, setBusySlots] = useState<string[]>([])


  useEffect(() => {
      const fetchBusySlots = async () => {
        if (!date || !selectedOdont) {
          setBusySlots([])
          return
        }
        const { data, error } = await supabase
          .from("citas")
          .select("hora_inicio, hora_final")
          .eq("fecha", date.toISOString().split("T")[0])
          .eq("odontologo", String(selectedOdont))
          .eq("estado", "Pendiente") // Opcional: solo citas activas

        if (!error && data) {
          // Convierte "08:00:00" a "08:00"
          const slots = data.map((cita: any) =>
            cita.hora_inicio.slice(0, 5)
          )
          setBusySlots(slots)
          console.log("busySlots:", slots)
          console.log("Busy slots:", busySlots)
        }
      }
    fetchBusySlots()
    

    const fetchPatients = async () => {
      setLoadingPatients(true)
      const { data, error } = await supabase
        .from("paciente")
        .select("cedula, nombre, apellidos")
      if (!error && data) setPatients(data)
      setLoadingPatients(false)
    }
    fetchPatients()
        const fetchOdont = async () => {
      setLoadingOdont(true)
      const { data, error } = await supabase
        .from("odontologo")
        .select("cedula, nombre, apellidos")
      if (!error && data) setOdont(data)
      setLoadingOdont(false)
    }
    fetchOdont()
  }, [date, selectedOdont])

  

  // Simulated available time slots
  const morningSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00","11:30"]
  const afternoonSlots = ["13:00", "13:30", "14:00","14:30"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
       console.log("Valor de timeSlot:", timeSlot) // <-- Aquí verás el valor en la consola
    if (!timeSlot)
       {
      setShowTimeSlotError(true)
      console.log("No hay timeslot"),
      toast({
      title: "Error",
      description: "Por favor selecciona una hora.",
      variant: "destructive",
      })
      
      return
    }

    const horaInicio = timeSlot
    let horaFinal = horaInicio

    if (appointmentType !== "revision" && horaInicio) {
    // Sumar 1 hora a la hora de inicio
    const [h, m] = horaInicio.split(":").map(Number)
    const dateObj = new Date()
    dateObj.setHours(h, m)
    dateObj.setHours(dateObj.getHours() + 1)
    const hFinal = String(dateObj.getHours()).padStart(2, "0")
    const mFinal = String(dateObj.getMinutes()).padStart(2, "0")
    horaFinal = `${hFinal}:${mFinal}`
  }else if (appointmentType === "revision" && horaInicio) {
    // Sumar 30 minutos a la hora de inicio
    const [h, m] = horaInicio.split(":").map(Number)
    const dateObj = new Date()
    dateObj.setHours(h, m)
    dateObj.setMinutes(dateObj.getMinutes() + 30) 
    const hFinal = String(dateObj.getHours()).padStart(2, "0")
    const mFinal = String(dateObj.getMinutes()).padStart(2, "0")
    horaFinal = `${hFinal}:${mFinal}`
  }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("citas") // Cambia "citas" por el nombre real de tu tabla de citas
        .insert([
          {
            fecha: date?.toISOString().split("T")[0], // Solo la fecha (YYYY-MM-DD)
            estado: "Pendiente",
            paciente: String(selectedPatient),
            odontologo: String(selectedOdont),
            emergencia: appointmentType === "urgent", // Solo true si es urgente
            duracion: timeSlot.length === 2,
            hora_inicio: horaInicio,
            hora_final: horaFinal,
            tipo: appointmentType,
            notas: notes,

          },
        ])

      if (error) throw error

      toast({
        title: "Cita agendada",
        description: "Tu cita ha sido agendada exitosamente.",
      })

      router.push("/dashboard/appointments")
    } catch (error: any) {
    console.error("Supabase error:", error)
    toast({
      title: "Error",
      description: error?.message || "Hubo un problema al agendar tu cita. Intenta de nuevo.",
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
    }
  }


const handleTimeSlotClick = (slot: string) => {
  setTimeSlot(slot)
  setShowTimeSlotError(false)
}

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-black">Agendar Nueva Cita</h1>
        <p className="text-muted-foreground">Selecciona el tipo de cita, fecha y hora disponible</p>
      </div>

      

      <form onSubmit={handleSubmit}>

        {/* Card para seleccionar paciente */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Paciente</CardTitle>
          <CardDescription>Selecciona el paciente para la cita</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPatients ? (
            <span className="text-muted-foreground">Cargando pacientes...</span>
          ) : (
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedPatient ?? ""}
              onChange={e => setSelectedPatient(Number(e.target.value))}
              required
            >
              <option value="" disabled>Selecciona un paciente</option>
              {patients.map((p) => (
                <option key={p.cedula} value={p.cedula}>
                  {p.nombre} {p.apellidos}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Odontólogo</CardTitle>
          <CardDescription>Selecciona el odontólogo para la cita</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPatients ? (
            <span className="text-muted-foreground">Cargando odontólogos...</span>
          ) : (
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedOdont ?? ""}
              onChange={e => setSelectedOdont(Number(e.target.value))}
              required
            >
              <option value="" disabled>Selecciona un odontólogo</option>
              {odont.map((o) => (
                <option key={o.cedula} value={o.cedula}>
                  {o.nombre} {o.apellidos}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Cita</CardTitle>
              <CardDescription>Selecciona el tipo de atención</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={appointmentType} onValueChange={setAppointmentType}>
                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="urgent" className="font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                      Urgente
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Para dolor agudo, exodoncias o emergencias. Duración: 1 hora.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="revision" id="revision" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="revision" className="font-medium flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-blue-500" />
                      Revisión por primera vez
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Chequeo general por primera vez. Duración: 30 min.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="operativa" id="operativa" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="operativa" className="font-medium flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-yellow-500" />
                      Operativa
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Cita con el fin de llevar a cabo una operación. Duración: 1 hora.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="treatment" id="treatment" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="treatment" className="font-medium flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                      Preventiva
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Chequeo general o consulta específica. Duración: 1 hora.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fecha</CardTitle>
              <CardDescription>Selecciona el día de la cita</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                required
                className="rounded-md border"
                disabled={(date) => {
                  // Disable weekends and past dates
                  const day = date.getDay()
                  return date < new Date(new Date().setHours(0, 0, 0, 0)) || day === 0 || day === 6
                }}
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Horario Disponible</CardTitle>
              <CardDescription>Selecciona la hora de la cita</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Mañana (8:00 - 12:00)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {morningSlots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={
                        busySlots.includes(slot)
                          ? "secondary" // o "destructive" para rojo
                          : timeSlot === slot
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleTimeSlotClick(slot)}
                      className="h-10"
                      disabled={busySlots.includes(slot)}
                    >
                      {slot}
                    </Button>

                    ))}
                  </div>
                </div>
                  {showTimeSlotError && (
                    <p className="text-red-500 text-sm mt-2">Debes seleccionar un horario.</p>
                  )}
                <div>
                  <h3 className="font-medium mb-2">Tarde (13:00 - 15:00)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {afternoonSlots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={
                        busySlots.includes(slot)
                          ? "secondary" // o "destructive" para rojo
                          : timeSlot === slot
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleTimeSlotClick(slot)}
                      className="h-10"
                      disabled={busySlots.includes(slot)}
                      
                    >
                      {slot}
                    </Button>
                    ))}
                  </div>
                </div>
                  {showTimeSlotError && (
                  <p className="text-red-500 text-sm mt-2">Debes seleccionar un horario.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
              <CardDescription>Proporciona cualquier información adicional relevante para la cita</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe brevemente el motivo de la consulta o cualquier síntoma relevante..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Agendando..." : "Agendar Cita"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

