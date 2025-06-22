"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabase-client"
import { debug } from "console"
import { PencilSquareIcon, TrashIcon,EyeIcon,  } from "@heroicons/react/24/outline"
import { PillBottle} from "lucide-react"
import ProtectedRoute from "@/lib/auth-context/protected-route"
export default function UsersPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [patientToEdit, setPatientToEdit] = useState<any>(null) // Almacena los datos del paciente a editar
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null) // Almacena la cédula del usuario a eliminar
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isViewAppointmentsOpen, setIsViewAppointmentsOpen] = useState(false)
  const [isViewTreatmentOpen, setIsViewTreatmentOpen] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [treatment, setTreatment] = useState<any[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [treatmentLoading, setTreatmentLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado para el modal
  const [searchTerm, setSearchTerm] = useState("")
  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    carnet:"",
    apellidos: "",
    correo: "",
    carrera: "",
    beca: "",
    informe: false,
    created_at: new Date().toISOString(), // Fecha actual por defecto
    updated_at: new Date().toISOString(), // Fecha actual por defecto
  })// Estado del formulario

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("paciente") // Reemplaza "paciente" con el nombre de tu tabla
        .select("*")

      if (error) {
        console.error("Error al cargar usuarios:", error.message)
      } else {
        setUsers(data || [])
      }
      setLoading(false)
    }

    fetchUsers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }


const handleViewAppointments = async (user: any) => {
  setPatientToEdit(user)
  setIsViewAppointmentsOpen(true)
  setAppointmentsLoading(true)

  const { data, error } = await supabase
    .from("citas")
    .select(`
      id, fecha, hora_inicio, hora_final, tipo, estado, notas,
      odontologo:odontologo (nombre, apellidos)
    `)
    .eq("paciente", user.cedula)
    .order("fecha", { ascending: false })

  if (!error && data) setAppointments(data)
  setAppointmentsLoading(false)
}

const handleViewTreatment = async (user: any) => {
  setPatientToEdit(user)
  setIsViewTreatmentOpen(true)
  setTreatmentLoading(true)

  const { data, error } = await supabase
    .from("tratamiento")
    .select(`
      id, fecha_asignacion, medicamentos, notas,
      odontologo:odontologo (nombre, apellidos))
    `)
    .eq("paciente", user.cedula)
    .order("fecha_asignacion", { ascending: false })

  if (!error && data) setTreatment(data)
  setTreatmentLoading(false)
}

const handleDeleteUser = async (cedula: string) => {
  // 1. Verifica si el paciente tiene citas registradas
  const { data: citas, error: citasError } = await supabase
    .from("citas")
    .select("id")
    .eq("paciente", cedula)

  if (citasError) {
    console.error("Error al verificar citas:", citasError.message)
    return
  }

  if (citas && citas.length > 0) {
    alert("No se puede eliminar el usuario porque tiene citas registradas.")
    return
  }

  // 2. Si no tiene citas, procede a eliminar
  const { error } = await supabase
    .from("paciente")
    .delete()
    .eq("cedula", cedula)

  if (error) {
    console.error("Error al eliminar usuario:", error.message)
  } else {
    console.log("Usuario eliminado exitosamente")
    // Actualiza la lista de usuarios después de eliminar
    const { data } = await supabase.from("paciente").select("*")
    setUsers(data || [])
  }
}


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    // Validación de longitud
    if (!validateCedulaAndCarnet(formData.cedula, formData.carnet)) {
      return
    }
  
    const isDuplicate = await checkDuplicate(formData.cedula, formData.carnet)
    if (isDuplicate) {
      alert("La cédula o el carnet ya existen en la base de datos.")
      return
    }
  
    // Ajusta el valor de "beca" si es "Null"
    const adjustedFormData = {
      ...formData,
      beca: formData.beca === "Null" ? null : formData.beca,
    }
  
    // Inserta los datos en la tabla "paciente"
    const { error } = await supabase.from("paciente").insert([adjustedFormData])
  
    if (error) {
      console.error("Error al agregar usuario:", error.message)
    } else {
      console.log("Usuario agregado exitosamente")
      setIsModalOpen(false) // Cierra el modal
      setFormData({
        cedula: "",
        nombre: "",
        apellidos: "",
        correo: "",
        carrera: "",
        beca: "",
        carnet: "",
        informe: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }) // Limpia el formulario
  
      // Recarga los usuarios después de agregar uno nuevo
      const { data } = await supabase.from("paciente").select("*")
      setUsers(data || [])
    }
  }

  const checkDuplicate = async (
    cedula: string,
    carnet: string,
    excludeCedula?: string
  ): Promise<boolean> => {
    let query = supabase
      .from("paciente")
      .select("cedula, carnet")
      .or(`cedula.eq.${cedula},carnet.eq.${carnet}`)
  
    // Excluir el registro actual si se proporciona `excludeCedula`
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

  const validateCedulaAndCarnet = (cedula: string, carnet: string): boolean => {
    if (cedula.length !== 9) {
      alert("La cédula debe tener exactamente 9 dígitos.")
      return false
    }
    if (carnet.length !== 10) {
      alert("El carnet debe tener exactamente 10 dígitos.")
      return false
    }
    return true
  }

  

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!patientToEdit) return
  
    // Validación de longitud
    if (!validateCedulaAndCarnet(patientToEdit.cedula, patientToEdit.carnet)) {
      return
    }
  
    // Verifica duplicados, excluyendo el registro actual
    const isDuplicate = await checkDuplicate(
      patientToEdit.cedula,
      patientToEdit.carnet,
      patientToEdit.cedula // Excluye el registro actual
    )
    if (isDuplicate) {
      alert("El carnet ya existe en la base de datos.")
      return
    }
  
    const { error } = await supabase
      .from("paciente")
      .update(patientToEdit)
      .eq("cedula", patientToEdit.cedula)
  
    if (error) {
      console.error("Error al actualizar paciente:", error.message)
    } else {
      console.log("Paciente actualizado exitosamente")
      setIsEditModalOpen(false) // Cierra el modal
      setPatientToEdit(null) // Limpia el paciente seleccionado
      const { data } = await supabase.from("paciente").select("*")
      setUsers(data || []) // Actualiza la lista de usuarios
    }
  }
  return (
    <ProtectedRoute>
    <div>
      <div className="flex items-center">
  <h1 className="text-2xl font-bold text-black">Gestión de Pacientes</h1>
  <button
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-500 ml-4"
    onClick={() => setIsModalOpen(true)} // Abre el modal
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
        <p className="text-black">Cargando usuarios...</p>
      ) : (

<table className="min-w-full mt-2 rounded-lg overflow-hidden shadow border border-gray-200 bg-white">
  <thead className="bg-blue-100">
    <tr>
      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Cédula</th>
      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Nombre</th>
      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Correo</th>
      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Carnet</th>
      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Carrera</th>
      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Beca</th>
      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Informe</th>
      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Opciones</th>
    </tr>
  </thead>
  <tbody>
    {filteredUsers.map((user, idx) => (
      <tr
        key={user.cedula}
        className={idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"}
      >
        <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.cedula}</td>
        <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.nombre} {user.apellidos}</td>
        <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.correo}</td>
        <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.carnet}</td>
        <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.carrera}</td>
        <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.beca ? "Sí" : "No"}</td>
        <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{user.informe ? "Sí" : "No"}</td>

<td className="px-4 py-2 border-b border-gray-200">
  <div className="flex items-center gap-2">
    <button
      className="p-2 rounded hover:bg-blue-100"
      title="Editar"
      onClick={() => {
        setPatientToEdit(user)
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
      <button
      className="p-2 rounded hover:bg-yellow-100"
      title="Ver tratamientos"
      onClick={() => handleViewTreatment(user)}
    >
      <PillBottle className="h-5 w-5 text-yellow-600" />
    </button>
  </div>
</td>
      </tr>
    ))}
  </tbody>
</table>
      )}

      {/* Modal */}
      {isViewAppointmentsOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-black">
        Citas de {patientToEdit?.nombre} {patientToEdit?.apellidos}
      </h2>
      {treatmentLoading ? (
        <p className="text-black">Cargando citas...</p>
      ) : appointments.length === 0 ? (
        <p className="text-black">No hay citas registradas para este paciente.</p>
      ) : (
        <table className="min-w-full rounded-lg overflow-hidden border border-gray-200 bg-white text-black text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Hora</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Odontólogo</th>
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
                  {cita.odontologo
                    ? `${cita.odontologo.nombre} ${cita.odontologo.apellidos}`
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
      {isViewTreatmentOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-black">
        Citas de {patientToEdit?.nombre} {patientToEdit?.apellidos}
      </h2>
      {treatmentLoading ? (
        <p className="text-black">Cargando tratamientos...</p>
      ) : treatment.length === 0 ? (
        <p className="text-black">Este paciente no tiene ningún tratamiento.</p>
      ) : (
        <table className="min-w-full rounded-lg overflow-hidden border border-gray-200 bg-white text-black text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Medicamentos</th>
              <th className="px-3 py-2 text-left">Odontologo</th>
              <th className="px-3 py-2 text-left">Notas</th>
            </tr>
          </thead>
          <tbody>
            {treatment.map((tratamiento) => (
              <tr key={tratamiento.id} className="border-b">
                <td className="px-3 py-2">{tratamiento.fecha_asignacion}</td>
                <td className="px-3 py-2 capitalize">{tratamiento.medicamentos}</td>
                <td className="px-3 py-2">
                  {tratamiento.odontologo
                    ? `${tratamiento.odontologo.nombre} ${tratamiento.odontologo.apellidos}`
                    : "Desconocido"}
                </td>
                <td className="px-3 py-2">{tratamiento.notas || "Sin notas"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex justify-end mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setIsViewTreatmentOpen(false)}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-50 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-black">Agregar Usuario</h2>
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
                <label className="block text-sm font-medium text-black">Carnet</label>
                <input
                  type="text"
                  name="carnet"
                  value={formData.carnet}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black "
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black">Carrera</label>
                <select
                  name="carrera"
                  value={formData.carrera || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
                  required
                >
                  <option value="" disabled>Seleccione una carrera</option>
                  <option value="Ingeniería en Computación">Ingeniería en Computación</option>
                  <option value="Ingeniería en Agronomía">Ingeniería en Agronomía</option>
                  <option value="Ingeniería en producción industrial">Ingeniería en Producción Industrial</option>
                  <option value="Ingeniería en Electrónica">Ingeniería en Electrónica</option>
                  <option value="Administración de empresas ">Administración de Empresas</option>
                  <option value="Gestión del Turismo Rural Sostenible">Gestión del Turismo Rural Sostenible</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black">Beca</label>
                <select
                  name="beca"
                  value={formData.beca || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
                >
                  <option value="" disabled>Seleccione su beca</option>
                  <option value="Null">N/A</option>
                  <option value="Beca Total Mauricio Campos">Beca Total Mauricio Campos</option>
                  <option value="Beca Engresado de Colegio Científico">Beca Engresado De Colegio Científico</option>
                  <option value="Beca Préstamo">Beca Préstamo</option>
                  <option value="Beca Exoneración Porcentual">Beca Exoneración Porcentual</option>
                  <option value="Residencias Estudiantiles">Residencias Estudiantiles</option>
                  <option value="Tip Tec">Tip Tec</option>
                  <option value="Beca Independiente">Beca Indepentiente</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="ml-1 flex items-center text-sm font-medium text-black">
                  Informe de matrícula
                  <input
                    type="checkbox"
                    name="informe"
                    checked={formData.informe || false}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.checked }))}
                    className="ml-2 h-4 w-4 rounded border-gray-300 bg-blue-500 checked:bg-blue-500"
                    style={{
                      backgroundColor: formData.informe ? "blue" : "red", // Estilo en línea para verificar
                    }}
                  />
                </label>
              </div>


              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                  onClick={() => setIsModalOpen(false)} // Cierra el modal
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


{isEditModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg w-90 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-black">Editar Información del Paciente</h2>
      <form onSubmit={handleEditSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={patientToEdit?.nombre || ""}
            onChange={(e) =>
              setPatientToEdit((prev: any) => ({ ...prev, nombre: e.target.value }))
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
            value={patientToEdit?.apellidos || ""}
            onChange={(e) =>
              setPatientToEdit((prev: any) => ({ ...prev, apellidos: e.target.value }))
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
            value={patientToEdit?.correo || ""}
            onChange={(e) =>
              setPatientToEdit((prev: any) => ({ ...prev, correo: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Carnet</label>
          <input
            type="text"
            name="carnet"
            value={patientToEdit?.carnet || ""}
            onChange={(e) =>
              setPatientToEdit((prev: any) => ({ ...prev, carnet: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Carrera</label>
          <select
            name="carrera"
            value={patientToEdit?.carrera || ""}
            onChange={(e) =>
              setPatientToEdit((prev: any) => ({ ...prev, carrera: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
            required
          >
            <option value="" disabled>Seleccione una carrera</option>
            <option value="Ingeniería en Computación">Ingeniería en Computación</option>
            <option value="Ingeniería en Agronomía">Ingeniería en Agronomía</option>
            <option value="Ingeniería en Producción Industrial">Ingeniería en Producción Industrial</option>
            <option value="Ingeniería en Electrónica">Ingeniería en Electrónica</option>
            <option value="Administración de Empresas">Administración de Empresas</option>
            <option value="Gestión del Turismo Rural Sostenible">Gestión del Turismo Rural Sostenible</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-black">Beca</label>
          <select
            name="beca"
            value={patientToEdit?.beca || ""}
            onChange={(e) =>
              setPatientToEdit((prev: any) => ({ ...prev, beca: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-300 text-black"
          >
            <option value="" disabled>Seleccione su beca</option>
            <option value="Null">N/A</option>
            <option value="Beca Total Mauricio Campos">Beca Total Mauricio Campos</option>
            <option value="Beca Engresado de Colegio Científico">Beca Engresado De Colegio Científico</option>
            <option value="Beca Préstamo">Beca Préstamo</option>
            <option value="Beca Exoneración Porcentual">Beca Exoneración Porcentual</option>
            <option value="Residencias Estudiantiles">Residencias Estudiantiles</option>
            <option value="Tip Tec">Tip Tec</option>
            <option value="Beca Independiente">Beca Independiente</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="ml-1 flex items-center text-sm font-medium text-black">
            Informe de matrícula
            <input
              type="checkbox"
              name="informe"
              checked={patientToEdit?.informe || false}
              onChange={(e) =>
                setPatientToEdit((prev: any) => ({ ...prev, informe: e.target.checked }))
              }
              className="ml-2 h-4 w-4 rounded border-gray-300 bg-blue-500 checked:bg-blue-500"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
            onClick={() => setIsEditModalOpen(false)} // Cierra el modal
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



      {isConfirmModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg w-80">
      <h2 className="text-xl font-bold mb-4 text-black">Confirmar Eliminación</h2>
      <p className="text-black mb-4">¿Estás seguro de que deseas eliminar este usuario?</p>
      <div className="flex justify-end">
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
          onClick={() => setIsConfirmModalOpen(false)} // Cierra el modal
        >
          Cancelar
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={async () => {
            if (userToDelete) {
              await handleDeleteUser(userToDelete) // Llama a la función para eliminar el usuario
              setIsConfirmModalOpen(false) // Cierra el modal
              setUserToDelete(null) // Limpia el usuario seleccionado
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