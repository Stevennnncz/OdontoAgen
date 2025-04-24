"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { AppointmentList } from "@/components/dashboard/appointment-list"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { DocumentUpload } from "@/components/dashboard/document-upload"
import { CalendarClock, FileCheck, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    documents: 0,
    urgent: 0,
  })

  // Simulated data - would come from API in real implementation
  useEffect(() => {
    // Fetch stats from API
    setStats({
      upcoming: 2,
      completed: 5,
      documents: 1,
      urgent: 0,
    })
  }, [])

  const isStudent = user?.role === "estudiante"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.firstName}</h1>
        <p className="text-muted-foreground">Gestiona tus citas y documentos desde este panel de control.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas Próximas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcoming === 1 ? "Cita pendiente" : "Citas pendientes"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">En los últimos 6 meses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.documents === 1 ? "Documento pendiente de revisión" : "Documentos pendientes de revisión"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Urgencias</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.urgent === 0 ? "No hay citas urgentes" : "Citas urgentes pendientes"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>Selecciona una fecha para ver o agendar citas</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            <div className="mt-4">
              <Button className="w-full" asChild>
                <Link href="/dashboard/appointments/new">Agendar Nueva Cita</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              Sube tu informe de matrícula para validar tu acceso a los servicios dentales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload />
          </CardContent>
        </Card>
      )}

      {!isStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Citas</CardTitle>
            <CardDescription>
              Administra las citas pendientes y revisa los documentos de los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Citas Pendientes</TabsTrigger>
                <TabsTrigger value="documents">Documentos por Revisar</TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <AppointmentList />
              </TabsContent>
              <TabsContent value="documents">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Ana García</p>
                        <p className="text-sm text-muted-foreground">Informe de matrícula - 12/05/2023</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                        <Button size="sm" variant="default">
                          Aprobar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

