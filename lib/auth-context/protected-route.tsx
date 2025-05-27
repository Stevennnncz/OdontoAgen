"use client"
import { useAuth } from "./auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/") // Redirige al login si no está autenticado
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-gray-500">Verificando acceso...</span>
      </div>
    )
  }

  return <>{children}</>
}