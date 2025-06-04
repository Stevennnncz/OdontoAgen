"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabase-client"
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline"
import ProtectedRoute from "@/lib/auth-context/protected-route"

export default function DoctorsPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [doctorToEdit, setDoctorToEdit] = useState<any>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isViewAppointmentsOpen, setIsViewAppointmentsOpen] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const filteredDoctors = doctors.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    apellidos: "",
    correo: "",
    telefono: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("odontologo")
        .select("*")

      if (error) {
        console.error("Error al cargar odontólogos:", error.message)
      } else {
        setDoctors(data || [])
      }
      setLoading(false)
    }

    fetchDoctors()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleViewAppointments = async (user: any) => {
    setDoctorToEdit(user)
    setIsViewAppointmentsOpen(true)
    setAppointmentsLoading(true)
    const { data, error } = await supabase
      .from("citas")
      .select(`
        id, fecha, hora_inicio, hora_final, tipo, estado, notas,
        paciente:paciente (nombre, apellidos)
      `)
      .eq("odontologo", user.cedula)
      .order("fecha", { ascending: false })

    if (!error && data) setAppointments(data)
    setAppointmentsLoading(false)
  }

  const handleDeleteUser = async (cedula: string) => {
    const { error } = await supabase
      .from("odontologo")
      .delete()
      .eq("cedula", cedula)

    if (error) {
      console.error("Error al eliminar odontólogo:", error.message)
    } else {
      console.log("Odontólogo eliminado exitosamente")
      const { data } = await supabase.from("odontologo").select("*")
      setDoctors(data || [])
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCedula(formData.cedula)) {
      return
    }

    const isDuplicate = await checkDuplicate(formData.cedula)
    if (isDuplicate) {
      alert("La cédula ya existe en la base de datos.")
      return
    }

    const { error } = await supabase.from("odontologo").insert([formData])

    if (error) {
      console.error("Error al agregar odontólogo:", error.message)
    } else {
      console.log("Odontólogo agregado exitosamente")
      setIsModalOpen(false)
      setFormData({
        cedula: "",
        nombre: "",
        apellidos: "",
        correo: "",
        telefono: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      const { data } = await supabase.from("odontologo").select("*")
      setDoctors(data || [])
    }
  }

  const checkDuplicate = async (
    cedula: string,
    excludeCedula?: string
  ): Promise<boolean> => {
    let query = supabase
      .from("odontologo")
      .select("cedula")
      .eq("cedula", cedula)

    if (excludeCedula) {
      query = query.not("cedula", "eq", excludeCedula)
    }

    const { data: existingUsers, error } = await query

    if (error) {
      console.error("Error al verificar duplicados:", error.message)
      return false
    }

    return existingUsers && existingUsers.length > 0
  }

  const validateCedula = (cedula: string): boolean => {
    if (cedula.length !== 9) {
      alert("La cédula debe tener exactamente 9 dígitos.")
      return false
    }
    return true
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!doctorToEdit) return

    if (!validateCedula(doctorToEdit.cedula)) {
      return
    }

    const isDuplicate = await checkDuplicate(
      doctorToEdit.cedula,
      doctorToEdit.cedula
    )
    if (isDuplicate) {
      alert("La cédula ya existe en la base de datos.")
      return
    }

    const { error } = await supabase
      .from("odontologo")
      .update(doctorToEdit)
      .eq("cedula", doctorToEdit.cedula)

    if (error) {
      console.error("Error al actualizar odontólogo:", error.message)
    } else {
      console.log("Odontólogo actualizado exitosamente")
      setIsEditModalOpen(false)
      setDoctorToEdit(null)
      const { data } = await supabase.from("odontologo").select("*")
      setDoctors(data || [])
    }
  }

  return (
    <ProtectedRoute>
      <div>
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-black">Gestión de Odontólogos</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-500 ml-4"
            onClick={() => setIsModalOpen(true)}
          >
            +
          </button>
        </div>
        <div className="mt-4 flex items-center">
          <input
            type="text"
            placeholder="Buscar por nombre, apellidos o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black bg-gray-100"
          />
        </div>
        <br />
        {loading ? (
          <p className="text-black">Cargando odontólogos...</p>
        ) : (
          <table className="min-w-full mt-2 rounded-lg overflow-hidden shadow border border-gray-200 bg-white">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Cédula</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase ">Correo</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Teléfono</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((user, idx) => (
                <tr
                  key={user.cedula}
                  className={idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"}
                >
                  <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.cedula}</td>
                  <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.nombre} {user.apellidos}</td>
                  <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.correo}</td>
                  <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.telefono}</td>

                  <td className="px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded hover:bg-blue-100"
                        title="Editar"
                        onClick={() => {
                          setDoctorToEdit(user)
                          setIsEditModalOpen(true)
                        }}
                      >
                        <PencilSquareIcon className="h-5 w-5 text-blue-600" />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-red-100"
                        title="Eliminar"
                        onClick={() => {
                          setUserToDelete(user.cedula)
                          setIsConfirmModalOpen(true)
                        }}
                      >
                        <TrashIcon className="h-5 w-5 text-red-600" />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-green-100"
                        title="Ver citas"
                        onClick={() => handleViewAppointments(user)}
                      >
                        <EyeIcon className="h-5 w-5 text-green-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal de citas */}
        {isViewAppointmentsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-black">
                Citas de {doctorToEdit?.nombre} {doctorToEdit?.apellidos}
              </h2>
              {appointmentsLoading ? (
                <p className="text-black">Cargando citas...</p>
              ) : appointments.length === 0 ? (
                <p className="text-black">No hay citas registradas para este odontólogo.</p>
              ) : (
                <table className="min-w-full rounded-lg overflow-hidden border border-gray-200 bg-white text-black text-sm">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Hora</th>
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-left">Paciente</th>
                      <th className="px-3 py-2 text-left">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((cita) => (
                      <tr key={cita.id} className="border-b">
                        <td className="px-3 py-2">{cita.fecha}</td>
                        <td className="px-3 py-2">{cita.hora_inicio} - {cita.hora_final}</td>
                        <td className="px-3 py-2 capitalize">{cita.tipo}</td>
                        <td className="px-3 py-2">{cita.estado}</td>
                        <td className="px-3 py-2">
                          {cita.paciente
                            ? `${cita.paciente.nombre} ${cita.paciente.apellidos}`
                            : "Desconocido"}
                        </td>
                        <td className="px-3 py-2">{cita.notas || "Sin notas"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="flex justify-end mt-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => setIsViewAppointmentsOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de agregar odontólogo */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-50 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-black">Agregar Odontólogo</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Cédula</label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm px-3 py-2 bg-gray-300 border-gray-300 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Correo</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black "
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black "
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-90 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-black">Editar Información del Odontólogo</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={doctorToEdit?.nombre || ""}
                    onChange={(e) =>
                      setDoctorToEdit((prev: any) => ({ ...prev, nombre: e.target.value }))
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={doctorToEdit?.apellidos || ""}
                    onChange={(e) =>
                      setDoctorToEdit((prev: any) => ({ ...prev, apellidos: e.target.value }))
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">Correo</label>
                  <input
                    type="email"
                    name="correo"
                    value={doctorToEdit?.correo || ""}
                    onChange={(e) =>
                      setDoctorToEdit((prev: any) => ({ ...prev, correo: e.target.value }))
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
                    required
                  />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-black">Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={doctorToEdit?.telefono || ""}
                        onChange={(e) =>
                            setDoctorToEdit((prev: any) => ({ ...prev, telefono: e.target.value }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
                        required
                    />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmación */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
              <h2 className="text-xl font-bold mb-4 text-black">Confirmar Eliminación</h2>
              <p className="text-black mb-4">¿Estás seguro de que deseas eliminar este odontólogo?</p>
              <div className="flex justify-end">
                <button
                  className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={async () => {
                    if (userToDelete) {
                      await handleDeleteUser(userToDelete)
                      setIsConfirmModalOpen(false)
                      setUserToDelete(null)
                    }
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}