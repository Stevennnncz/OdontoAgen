"use client"
import { useState } from "react"
import supabase from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsLoading(true)
  
    try {
      const { error } = await supabase.auth.updateUser({ password })
  
      if (error) {
        throw error
      }
  
      setMessage("Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión en unos momentos.")
      setTimeout(() => router.push("/"), 3000) // Redirige al login después de 3 segundos
    } catch (err: any) {
      setError(err.message || "Error al restablecer la contraseña. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow text-black">
        <h1 className="text-2xl font-bold text-center mb-4">Restablecer Contraseña</h1>
        <form onSubmit={handleResetPassword}>
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
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-350 text-white placeholder-white border border-gray-350"
              />
            </div>
            <Button type="submit" className="w-full bg-gray-300" disabled={isLoading}>
              {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}