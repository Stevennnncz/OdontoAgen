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
      subject: "Nueva cita odontológica",
      text: `Hola ${nombre} ${apellidos},\n\nse ha agendado una cita el día ${fecha} de ${hora_inicio} a ${hora_final}.\n\nSi tienes dudas, contáctanos.`,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error enviando correo:", error)
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 500 })
  }
}
