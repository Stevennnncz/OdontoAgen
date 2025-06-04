"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import CalendarAppointments from "@/components/ui/calendar-appointments"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context/auth-context"
import { AppointmentList } from "@/components/dashboard/appointment-list"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { CalendarClock, FileCheck, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/lib/auth-context/protected-route"
import supabase from "@/lib/supabase-client"
export default function DashboardPage() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [todayCount, setTodayCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  // Simulated data - would come from API in real implementation
  useEffect(() => {
    const fetchTodayCounts = async () => {
      const today = new Date().toISOString().split("T")[0]

      // Citas pendientes
      const { count: pendingCount } = await supabase
        .from("citas")
        .select("*", { count: "exact", head: true })
        .eq("fecha", today)
        .eq("estado", "Pendiente")

      setTodayCount(typeof pendingCount === "number" ? pendingCount : 0)

      // Citas completadas
      const { count: completedCount } = await supabase
        .from("citas")
        .select("*", { count: "exact", head: true })
        .eq("fecha", today)
        .eq("estado", "Completada")

      setCompletedCount(typeof completedCount === "number" ? completedCount : 0)
    }
    fetchTodayCounts()
  }, [])


  return (
     <ProtectedRoute>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Bienvenido</h1>
        <p className="text-muted-foreground">Gestiona tus citas desde este panel de control.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas Próximas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">
              {todayCount === 1 ? "Cita pendiente hoy" : "Citas pendientes hoy"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {completedCount === 1 ? "Cita completada hoy" : "Citas completadas hoy"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 self-start" >
          <CardHeader>
            <CardTitle>Tus Próximas Citas</CardTitle>
            <CardDescription>Visualiza y gestiona tus próximas citas dentales</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingAppointments />
            <div className="mt-4 flex justify-end">
              <Button asChild>
                <Link href="/dashboard/appointments">Ver todas las citas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 self-start">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>Selecciona una fecha para ver o agendar citas</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarAppointments   />
            <div className="mt-10 mb-5">
              <Button className="w-full" asChild >
                <Link href="/dashboard/appointments/new">Agendar Nueva Cita</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
        </ProtectedRoute>
  )
}

