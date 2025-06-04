import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import supabase from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

export default function CalendarAppointments() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
    function formatTipo(tipo: string) {
    switch (tipo) {
        case "revision":
        return "Revisión"
        case "urgent":
        return "Urgente"
        case "treatment":
        return "Tratamiento"
        default:
        return tipo.charAt(0).toUpperCase() + tipo.slice(1)
    }
    }
  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from("citas")
        .select(`
          id,
          hora_inicio,
          hora_final,
          paciente:paciente (nombre, apellidos),
          odontologo:odontologo (nombre, apellidos),
          tipo,
          estado
        `)
        .eq("fecha", selectedDate.toISOString().split("T")[0])
      setAppointments(!error && data ? data : [])
      setLoading(false)
    }
    fetchAppointments()
  }, [selectedDate])

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-2">
          Citas para {selectedDate?.toLocaleDateString("es-ES")}
        </h2>
        {loading ? (
          <span className="text-muted-foreground">Cargando citas...</span>
        ) : appointments.length === 0 ? (
          <span className="text-muted-foreground">No hay citas para este día.</span>
        ) : (
            <ul className="space-y-2">
            {appointments.map((app) => (
                <li
                key={app.id}
                className="border rounded p-2 flex flex-col gap-1"
                >
                <div>
                    <span className="font-semibold">{app.hora_inicio} - {app.hora_final}</span>
                </div>
                <div>
                    <span>
                    {app.paciente
                        ? `${app.paciente.nombre} ${app.paciente.apellidos}`
                        : "Paciente desconocido"}
                    </span>
                </div>
                <div>
                    <span className="text-xs">{app.estado}</span>
                    <Badge className="ml-2 px-2 py-0.5 text-xs">
                    {formatTipo(app.tipo)}
                    </Badge>
                </div>
                </li>
            ))}
            </ul>
        )}
      </div>
    </div>
  )
}