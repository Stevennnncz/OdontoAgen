"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {User,RegisterData,AuthContextType} from "./models/interface"
import supabase from "@/lib/supabase-client"



const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
  
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log("Stored user:", user);
      
      setUser(user);
    }
    
    setIsLoading(false);
  }, []);
  

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Llamada a Supabase para autenticar al usuario
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw new Error(error.message)
      }
  
      if (!data || !data.user) {
        throw new Error("No se pudo autenticar al usuario. Por favor, intenta de nuevo.")
      }
  
      // Establecer el usuario autenticado
      const userData: User = {
        id: data.user.id,
        firstName: data.user.user_metadata?.firstName,
        lastName: data.user.user_metadata?.lastName,
        email: data.user.user_metadata?.email,
        role: data.user.user_metadata?.role || "estudiante", // Ajusta según tu implementación
      }
  
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

 
  }

  const logout = async () => {
    await supabase.auth.signOut()
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

