import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { SmileIcon as Tooth, Calendar, Clock, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Tooth className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Clínica Dental TEC</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Gestión de Citas Dentales</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema integral para la gestión de citas en la clínica dental universitaria. Solicita, gestiona y recibe
            recordatorios de tus citas dentales.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Agenda tu Cita</CardTitle>
              <CardDescription>Reserva tu cita dental según tu disponibilidad</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Selecciona el tipo de atención que necesitas y encuentra el horario que mejor se adapte a tu agenda.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/register">Comenzar</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Gestión Eficiente</CardTitle>
              <CardDescription>Administra tus citas fácilmente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Recibe recordatorios, reprograma o cancela tus citas con anticipación cuando sea necesario.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/login">Acceder</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Seguridad Garantizada</CardTitle>
              <CardDescription>Tus datos están protegidos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Sistema seguro con autenticación avanzada y protección de información personal y médica.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/about">Más Información</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>

      <footer className="bg-gray-100 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>© {new Date().getFullYear()} Clínica Dental Universitaria. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

