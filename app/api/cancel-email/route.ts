import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, nombre, apellidos, fecha, hora_inicio, hora_final } = body

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Cancelación de cita odontológica",
      text: `Hola ${nombre} ${apellidos},\n\nTu cita del día ${fecha} de ${hora_inicio} a ${hora_final} ha sido cancelada por el administrador.\n\nSi tienes dudas, contáctanos.`,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 500 })
  }
}