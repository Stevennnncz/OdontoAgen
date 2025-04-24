"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { AppointmentList } from "@/components/dashboard/appointment-list"

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const isAdmin = user?.role === "administrador" || user?.role === "asistente"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citas</h1>
          <p className="text-muted-foreground">Gestiona todas tus citas dentales</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/appointments/new">
            <Calendar className="mr-2 h-4 w-4" />
            Nueva Cita
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Citas</CardTitle>
          <CardDescription>Visualiza y gestiona tus citas programadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar citas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="revision">Revisión</SelectItem>
                  <SelectItem value="treatment">Tratamiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Próximas</TabsTrigger>
              <TabsTrigger value="past">Pasadas</TabsTrigger>
              {isAdmin && <TabsTrigger value="all">Todas</TabsTrigger>}
            </TabsList>
            <TabsContent value="upcoming">
              <AppointmentList
                filter="upcoming"
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                filterType={filterType}
              />
            </TabsContent>
            <TabsContent value="past">
              <AppointmentList
                filter="past"
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                filterType={filterType}
              />
            </TabsContent>
            {isAdmin && (
              <TabsContent value="all">
                <AppointmentList
                  filter="all"
                  searchTerm={searchTerm}
                  filterStatus={filterStatus}
                  filterType={filterType}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

