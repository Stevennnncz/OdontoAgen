"use client"

import type React from "react"
import supabase from "@/lib/supabase-client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context/auth-context"
import { CalendarClock, AlertCircle, ShieldCheck, Stethoscope } from "lucide-react"
import Select from 'react-select'




export default function NewAppointmentPage() {
  const topRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointmentType, setAppointmentType] = useState("revision")
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [showTimeSlotError, setShowTimeSlotError] = useState(false)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<{ cedula: number; nombre: string; apellidos: string; informe?: boolean }[]>([])
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [odont, setOdont] = useState<{ cedula: number; nombre: string; apellidos: string }[]>([])
  const [selectedOdont, setSelectedOdont] = useState<number | null>(null)
  const [loadingOdont, setLoadingOdont] = useState(true)
  const [busySlots, setBusySlots] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<"today" | "month" | "all">("all")
  const [formError, setFormError] = useState<string | null>(null)


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
        .select("cedula, nombre, apellidos, informe")
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
  const morningSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
  const afternoonSlots = ["13:00", "13:30", "14:00", "14:30"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Paciente seleccionado:", selectedPatient)
    const selectedPatientObj = patients.find(p => String(p.cedula) === String(selectedPatient))
    console.log("Paciente seleccionado:", selectedPatientObj)
    if (!selectedPatientObj?.informe) {
      setFormError("El paciente no tiene el informe de matrícula registrado. No puedes agendar la cita.")
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth" })
      }
      return
    }


    console.log("Valor de timeSlot:", timeSlot) // <-- Aquí verás el valor en la consola
    if (!timeSlot) {
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
    } else if (appointmentType === "revision" && horaInicio) {
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


      const { data: pacienteData } = await supabase
        .from("paciente")
        .select("correo, nombre, apellidos, informe")
        .eq("cedula", selectedPatient)
        .single()

      if (pacienteData?.correo) {
        await fetch("/api/new-appointment-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: pacienteData.correo,
            nombre: pacienteData.nombre,
            apellidos: pacienteData.apellidos,
            fecha: date?.toISOString().split("T")[0],
            hora_inicio: horaInicio,
            hora_final: horaFinal,
            tipo: appointmentType,
          }),
        })
      }



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
    <div ref={topRef}  className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Agendar Nueva Cita</h1>
        <p className="text-primary text-lg">Selecciona el tipo de cita, fecha y hora disponible</p>
      </div>



      <form onSubmit={handleSubmit}>

        {/* Card para seleccionar paciente */}
        <Card className="mb-4 shadow-sm border-teal-100 bg-card">
          <CardHeader>
            <CardTitle>Paciente</CardTitle>
            <CardDescription>Selecciona el paciente para la cita</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPatients ? (
              <span className="text-muted-foreground">Cargando pacientes...</span>
            ) : (
              <>
                <Select
                  className="w-full"
                  classNamePrefix="react-select"
                  options={patients.map((p) => ({
                    value: p.cedula,
                    label: `${p.nombre} ${p.apellidos}`
                  }))}
                  value={patients.find(p => String(p.cedula) === String(selectedPatient)) ? {
                    value: selectedPatient,
                    label: patients.find(p => String(p.cedula) === String(selectedPatient))?.nombre + ' ' + patients.find(p => String(p.cedula) === String(selectedPatient))?.apellidos
                  } : null}
                  onChange={option => {
                    setSelectedPatient(option ? option.value : null)
                    setFormError(null)
                  }}
                  placeholder="Selecciona un paciente"
                  isClearable
                  styles={{
                    control: (base) => ({ ...base, backgroundColor: 'white', color: 'black', borderColor: 'var(--border)', boxShadow: 'none' }),
                    singleValue: (base) => ({ ...base, color: 'black' }),
                    placeholder: (base) => ({ ...base, color: 'black' }),
                    menu: (base) => ({ ...base, backgroundColor: 'white', color: 'black' }),
                    option: (base, state) => ({ ...base, color: 'black', backgroundColor: state.isFocused ? '#e0f2fe' : 'white' }),
                  }}
                />
                {formError && (
                  <p className="text-red-500 text-sm mt-2">{formError}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4 shadow-sm border-teal-100 bg-card">
          <CardHeader>
            <CardTitle>Odontólogo</CardTitle>
            <CardDescription>Selecciona el odontólogo para la cita</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOdont ? (
              <span className="text-muted-foreground">Cargando odontólogos...</span>
            ) : (
              <Select
                className="w-full"
                classNamePrefix="react-select"
                options={odont.map((o) => ({
                  value: o.cedula,
                  label: `${o.nombre} ${o.apellidos}`
                }))}
                value={odont.find(o => String(o.cedula) === String(selectedOdont)) ? {
                  value: selectedOdont,
                  label: odont.find(o => String(o.cedula) === String(selectedOdont))?.nombre + ' ' + odont.find(o => String(o.cedula) === String(selectedOdont))?.apellidos
                } : null}
                onChange={option => setSelectedOdont(option ? option.value : null)}
                placeholder="Selecciona un odontólogo"
                isClearable
                styles={{
                  control: (base) => ({ ...base, backgroundColor: 'white', color: 'black', borderColor: 'var(--border)', boxShadow: 'none' }),
                  singleValue: (base) => ({ ...base, color: 'black' }),
                  placeholder: (base) => ({ ...base, color: 'black' }),
                  menu: (base) => ({ ...base, backgroundColor: 'white', color: 'black' }),
                  option: (base, state) => ({ ...base, color: 'black', backgroundColor: state.isFocused ? '#e0f2fe' : 'white' }),
                }}
              />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm border-teal-100 bg-card">
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
                      <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
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
                      <CalendarClock className="h-4 w-4 mr-2 text-teal-600" />
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
                      <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
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
                      <ShieldCheck className="h-4 w-4 mr-2 text-emerald-600" />
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

          <Card className="shadow-sm border-teal-100 bg-card">
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

          <Card className="md:col-span-2 shadow-sm border-teal-100 bg-card">
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
                            ? "secondary"
                            : timeSlot === slot
                              ? "default"
                              : "outline"
                        }
                        onClick={() => handleTimeSlotClick(slot)}
                        className={`h-10 transition-all duration-200 ${
                          busySlots.includes(slot)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                            : timeSlot === slot
                              ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                              : "hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700"
                        }`}
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
                            ? "secondary"
                            : timeSlot === slot
                              ? "default"
                              : "outline"
                        }
                        onClick={() => handleTimeSlotClick(slot)}
                        className={`h-10 transition-all duration-200 ${
                          busySlots.includes(slot)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                            : timeSlot === slot
                              ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                              : "hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700"
                        }`}
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

          <Card className="md:col-span-2 shadow-sm border-teal-100 bg-card">
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
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.back()}
                className="hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200 disabled:bg-primary/50"
              >
                {isLoading ? "Agendando..." : "Agendar Cita"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

