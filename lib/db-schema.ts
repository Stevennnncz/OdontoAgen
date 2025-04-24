// Este archivo define el esquema de la base de datos PostgreSQL
/*
export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  password_hash: string
  role: "estudiante" | "asistente" | "administrador"
  student_id?: string
  created_at: Date
  updated_at: Date
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  date: Date
  time: string
  type: "urgent" | "revision" | "treatment"
  status: "pending" | "completed" | "cancelled"
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface Document {
  id: string
  user_id: string
  type: "matricula" | "otro"
  file_path: string
  status: "pending" | "approved" | "rejected"
  reviewer_id?: string
  review_notes?: string
  created_at: Date
  updated_at: Date
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: "user" | "appointment" | "document"
  entity_id: string
  details: Record<string, any>
  created_at: Date
}

// SQL para crear las tablas

/*
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('estudiante', 'asistente', 'administrador')),
  student_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  time VARCHAR(5) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('urgent', 'revision', 'treatment')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('matricula', 'otro')),
  file_path VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logs de auditoría
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
*/

