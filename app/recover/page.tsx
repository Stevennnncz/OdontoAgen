"use client"
import { useState } from "react"
import supabase from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recover/reset-password`, // URL a la que se redirige después de restablecer
      })

      if (error) {
        throw error
      }

      setMessage("Se ha enviado un correo para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.")
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo de restablecimiento. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-4 text-black">Restablecer Contraseña</h1>
        <form onSubmit={handleForgotPassword}>
          {message && (
            <Alert variant="default" className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="space-y-2 text-black ">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-350 text-white placeholder-white border border-gray-350"
              />
            </div>
            <Button type="submit" className="w-full bg-gray-300 hover:bg-gray-400" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar correo de restablecimiento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}