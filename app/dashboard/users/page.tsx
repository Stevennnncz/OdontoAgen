"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabase-client"
import { debug } from "console"

export default function UsersPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [patientToEdit, setPatientToEdit] = useState<any>(null) // Almacena los datos del paciente a editar
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null) // Almacena la cédula del usuario a eliminar
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado para el modal
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

  const handleDeleteUser = async (cedula: string) => {
    const { error } = await supabase
      .from("paciente") // Reemplaza "paciente" con el nombre de tu tabla
      .delete()
      .eq("cedula", cedula) // Filtra por la cédula del usuario
  
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
    <div>
      <div className="flex items-center">
  <h1 className="text-2xl font-bold text-black">Gestión de Usuarios</h1>
  <button
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-500 ml-4"
    onClick={() => setIsModalOpen(true)} // Abre el modal
  >
    +
  </button>
</div>
      <br />
      {loading ? (
        <p className="text-black">Cargando usuarios...</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-200 mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-black">Cedula</th>
              <th className="border border-gray-300 px-2 py-1 text-black">Nombre</th>
              <th className="border border-gray-300 px-2 py-1 text-black">Correo</th>
              <th className="border border-gray-300 px-2 py-1 text-black">Carnet</th>
              <th className="border border-gray-300 px-2 py-1 text-black">Carrera</th>
              <th className="border border-gray-300 px-2 py-1 text-black">Beca</th>
              <th className="border border-gray-300 px-2 py-1 text-black">Informe</th>
              <th className="border border-gray-300 px-2 py-1 text-black">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.cedula}>
                <td className="border border-gray-300  px-1 py-2 text-black">{user.cedula}</td>
                <td className="border border-gray-300 px-1 py-2 text-black">{user.nombre} {user.apellidos}</td>
                <td className="border border-gray-300 px-1 py-2 text-black">{user.correo}</td>
                <td className="border border-gray-300 px-1 py-2 text-black">{user.carnet}</td>
                <td className="border border-gray-300 px-1 py-2 text-black">{user.carrera}</td>
                <td className="border border-gray-300 px-1 py-2 text-black">{user.beca ? "Si" : "No"}</td>
                <td className="border border-gray-300 px-1 py-2 text-black">{user.informe ? "Sí" : "No"}</td>
                <td className="border border-gray-300 px-1 py-2 text-black">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPatientToEdit(user) // Almacena los datos del paciente a editar
                      setIsEditModalOpen(true) // Abre el modal de edición
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-.707.464l-4 1a1 1 0 01-1.265-1.265l1-4a2 2 0 01.464-.707z"
                      />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(user.cedula) // Almacena la cédula del usuario
                      setIsConfirmModalOpen(true) // Abre el modal de confirmación
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-6 0h6"
                      />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </td>
                            
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
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
  )
}