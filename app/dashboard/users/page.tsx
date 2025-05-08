"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabase-client"

export default function UsersPage() {
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    // Verifica si la cédula o el carnet ya existen en la base de datos
    const { data: existingUsers, error: fetchError } = await supabase
      .from("paciente")
      .select("cedula, carnet")
      .or(`cedula.eq.${formData.cedula},carnet.eq.${formData.carnet}`)
  
    if (fetchError) {
      console.error("Error al verificar duplicados:", fetchError.message)
      return
    }
  
    if (existingUsers && existingUsers.length > 0) {
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
              <th className="border border-gray-300 px-4 py-2 text-black">Carnet</th>
              <th className="border border-gray-300 px-4 py-2 text-black">Nombre</th>
              <th className="border border-gray-300 px-4 py-2 text-black">Correo</th>
              <th className="border border-gray-300 px-4 py-2 text-black">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.cedula}>
                <td className="border border-gray-300 px-4 py-2 text-black">{user.cedula}</td>
                <td className="border border-gray-300 px-4 py-2 text-black">{user.nombre} {user.apellido}</td>
                <td className="border border-gray-300 px-4 py-2 text-black">{user.correo}</td>
                <td className="border border-gray-300 px-4 py-2 text-black">
                  <button
                    onClick={() => console.log("Acción para el usuario:", user)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Acción
                  </button>
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
    </div>
  )
}