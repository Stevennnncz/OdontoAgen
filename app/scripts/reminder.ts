import 'dotenv/config'
import supabase from "@/lib/supabase-client"

async function main() {
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
    console.error('Error buscando citas:', error)
    return
  }

  for (const cita of citas) {
    if (!Array.isArray(cita.paciente) || !cita.paciente[0]?.correo) continue

    // Llama a tu API para enviar el correo
    await fetch(`${process.env.API_URL}/api/reminder-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: cita.paciente[0].correo,
        subject: 'Recordatorio de cita odontológica',
        text: `Hola ${cita.paciente[0].nombre} ${cita.paciente[0].apellidos},\n\nTe recordamos que tienes una cita el ${cita.fecha} a las ${cita.hora_inicio}.\n\nPor favor, llega 10 minutos antes.`,
        html: `<p>Hola <b>${cita.paciente[0].nombre} ${cita.paciente[0].apellidos}</b>,<br><br>Te recordamos que tienes una cita el <b>${cita.fecha}</b> a las <b>${cita.hora_inicio}</b>.<br><br>Por favor, llega 10 minutos antes.</p>`
      })
    })
    console.log(`Recordatorio enviado a ${cita.paciente[0].correo}`)
  }
}

main()