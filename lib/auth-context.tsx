"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "estudiante" | "asistente" | "administrador"
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  studentId: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication
    if (email === "estudiante@ejemplo.com" && password === "password") {
      const userData: User = {
        id: "1",
        firstName: "Ana",
        lastName: "García",
        email: "estudiante@ejemplo.com",
        role: "estudiante",
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } else if (email === "asistente@ejemplo.com" && password === "password") {
      const userData: User = {
        id: "2",
        firstName: "Carlos",
        lastName: "López",
        email: "asistente@ejemplo.com",
        role: "asistente",
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } else if (email === "admin@ejemplo.com" && password === "password") {
      const userData: User = {
        id: "3",
        firstName: "María",
        lastName: "Sánchez",
        email: "admin@ejemplo.com",
        role: "administrador",
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } else {
      throw new Error("Credenciales inválidas")
    }
  }

  const register = async (data: RegisterData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock registration
    const userData: User = {
      id: "4",
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role as "estudiante" | "asistente" | "administrador",
    }

    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

