// app/api/reminder-cron/route.ts
import { NextRequest, NextResponse } from "next/server"
import supabase from "@/lib/supabase-client"

export async function POST(req: NextRequest) {
  // Calcula la fecha de mañana
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const yyyy = tomorrow.getFullYear()
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const dd = String(tomorrow.getDate()).padStart(2, '0')
  const fecha = `${yyyy}-${mm}-${dd}`

  // Busca citas para mañana
  const { data: citas, error } = await supabase
    .from('citas')
    .select(`
      id, fecha, hora_inicio, paciente:paciente (correo, nombre, apellidos)
    `)
    .eq('fecha', fecha)
    .eq('estado', 'Pendiente')

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  let enviados = 0
  for (const cita of citas ?? []) {
    if (!Array.isArray(cita.paciente) || !cita.paciente[0]?.correo) continue

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/reminder-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: cita.paciente[0].correo,
        subject: 'Recordatorio de cita odontológica',
        text: `Hola ${cita.paciente[0].nombre} ${cita.paciente[0].apellidos},\n\nTe recordamos que tienes una cita el ${cita.fecha} a las ${cita.hora_inicio}.\n\nPor favor, llega 10 minutos antes.`,
        html: `<p>Hola <b>${cita.paciente[0].nombre} ${cita.paciente[0].apellidos}</b>,<br><br>Te recordamos que tienes una cita el <b>${cita.fecha}</b> a las <b>${cita.hora_inicio}</b>.<br><br>Por favor, llega 10 minutos antes.</p>`
      })
    })
    enviados++
  }

  return NextResponse.json({ ok: true, enviados })
}