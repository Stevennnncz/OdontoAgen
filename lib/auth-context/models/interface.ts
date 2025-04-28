export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "estudiante" | "asistente" | "administrador"
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  studentId: string
  role: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void

}

