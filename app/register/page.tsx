"use client"
import supabase from "@/lib/supabase-client"
import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SmileIcon as Tooth } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context/auth-context"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    role: "estudiante",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
  
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
  
    setIsLoading(true)
  
    try {
      // Verificar si ya existe un usuario con el mismo correo o studentID
      const { data: existingUsers, error: checkError } = await supabase
        .from("users") // Reemplaza con el nombre de tu tabla
        .select("*")
        .or(`email.eq.${formData.email},student_id.eq.${formData.studentId}`)
  
      if (checkError) {
        throw new Error(checkError.message)
      }
  
      if (existingUsers && existingUsers.length > 0) {
        setError("Ya existe un usuario con este correo o número de matrícula.")
        return
      }
  
      // Inserción en la base de datos
      const { data, error } = await supabase
        .from("users") // Reemplaza con el nombre de tu tabla
        .insert([
          {
            first_name: formData.firstName, // Reemplaza con los nombres de las columnas en tu tabla
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password, // Asegúrate de manejar contraseñas de forma segura (por ejemplo, usando hashing)
            student_id: formData.studentId,
            role: "student",
          },
        ])
  
      if (error) {
        throw new Error(error.message)
      }
  
      console.log("Usuario registrado:", data)
  
      // Redirigir al login después del registro exitoso
      router.push("/login")
    } catch (err: any) {
      setError(err.message || "Error al registrar. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Tooth className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate para acceder al sistema de citas dentales</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Número de matrícula</Label>
                <Input id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

