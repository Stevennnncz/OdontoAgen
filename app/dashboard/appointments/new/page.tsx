"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context/auth-context"
import { CalendarClock, Clock, AlertCircle } from "lucide-react"

export default function NewAppointmentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointmentType, setAppointmentType] = useState("revision")
  const [timeSlot, setTimeSlot] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Simulated available time slots
  const morningSlots = ["8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00"]
  const afternoonSlots = ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !timeSlot) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha y hora para tu cita.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Cita agendada",
        description: "Tu cita ha sido agendada exitosamente.",
      })

      router.push("/dashboard/appointments")
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al agendar tu cita. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Agendar Nueva Cita</h1>
        <p className="text-muted-foreground">Selecciona el tipo de cita, fecha y hora disponible</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Cita</CardTitle>
              <CardDescription>Selecciona el tipo de atención que necesitas</CardDescription>
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
                      Para dolor agudo, exodoncias o emergencias. Duración: 30-45 min.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value="revision" id="revision" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="revision" className="font-medium flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-blue-500" />
                      Revisión
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Chequeo general o consulta específica. Duración: 30 min.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="treatment" id="treatment" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="treatment" className="font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      Limpieza o Tratamiento
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Limpieza dental o continuación de tratamiento. Duración: 1 hora.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fecha</CardTitle>
              <CardDescription>Selecciona el día para tu cita</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
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
              <CardDescription>Selecciona la hora para tu cita</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Mañana (8:00 - 11:30)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {morningSlots.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant={timeSlot === slot ? "default" : "outline"}
                        onClick={() => setTimeSlot(slot)}
                        className="h-10"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Tarde (12:30 - 15:00)</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {afternoonSlots.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant={timeSlot === slot ? "default" : "outline"}
                        onClick={() => setTimeSlot(slot)}
                        className="h-10"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notas Adicionales</CardTitle>
              <CardDescription>Proporciona cualquier información adicional relevante para tu cita</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe brevemente el motivo de tu consulta o cualquier síntoma relevante..."
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

