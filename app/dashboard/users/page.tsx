"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabase-client"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("users") // Reemplaza "users" con el nombre de tu tabla
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-black">Gestión de Usuarios</h1>
      <p className="text-gray-600 mb-4 text-black">Aquí puedes gestionar los usuarios del sistema.</p>

      {loading ? (
        <p className="text-black">Cargando usuarios...</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-200">
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
              <tr key={user.id}>
                <td className="border border-gray-300 px-4 py-2 text-black">{user.student_id}</td>
                <td className="border border-gray-300 px-4 py-2 text-black">{user.first_name} {user.last_name}</td>
                <td className="border border-gray-300 px-4 py-2 text-black">{user.email}</td>
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
    </div>
  )
}