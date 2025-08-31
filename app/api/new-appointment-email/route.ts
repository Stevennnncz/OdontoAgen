import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, nombre, apellidos, fecha, hora_inicio, hora_final } = body

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: "OdontoAgen <odontologiatecsancarlos@gmail.com>",
      to: email,
      subject: "Cita Odontología TEC Agendada",
      text: `Estimado/a ${nombre} ${apellidos},
      Le confirmamos que su cita en la Clínica de Odontología del TEC ha sido agendada para el día ${fecha}, de ${hora_inicio} a ${hora_final}.
      Le recordamos que las ausencias injustificadas generan un cobro. Si no podrá asistir, por favor notifíquenos con al menos 24 horas de antelación.

      Este correo es únicamente para notificaciones automáticas de citas.  
      Para consultas o cambios, escríbanos a: citasodontologiasc@itcr.ac.cr  
      O visítenos directamente en la clínica.

      Atentamente,  
      Clínica de Odontología TEC San Carlos`    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error enviando correo:", error)
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 500 })
  }
}
