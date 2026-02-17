-- 1. Eliminar tablas si existen para empezar limpio (útil en desarrollo)
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS academic_periods;
DROP TABLE IF EXISTS users;

-- 2. Crear tabla de USUARIOS (Admin, Profesores, Alumnos)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- En producción, esto debe ser un Hash
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    matricula VARCHAR(20) UNIQUE, -- Matrícula para alumnos o No. Empleado para profes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla de PERIODOS ACADÉMICOS (Cuatrimestres)
CREATE TABLE academic_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Ej: "Enero - Abril 2024"
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT FALSE -- Solo un periodo debe estar activo a la vez
);

-- 4. Crear tabla de MATERIAS
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    career VARCHAR(100), -- Ej: "Mecatrónica", "TICs"
    credits INT DEFAULT 5
);

-- 5. Crear tabla de GRUPOS (La relación entre Profe, Materia y Periodo)
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL, -- Ej: "3A", "4B"
    subject_id INT REFERENCES subjects(id),
    teacher_id INT REFERENCES users(id),
    period_id INT REFERENCES academic_periods(id),
    classroom VARCHAR(20), -- Aula
    UNIQUE(subject_id, teacher_id, period_id, name) -- Evitar duplicados
);

-- 6. Crear tabla de INSCRIPCIONES (Alumnos en Grupos)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id),
    group_id INT REFERENCES groups(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, group_id) -- Un alumno no puede estar dos veces en la misma clase
);

-- 7. Crear tabla de CALIFICACIONES
-- Nota: Las UTs suelen manejar 3 parciales y un promedio final.
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    p1 DECIMAL(4,2), -- Calificación Parcial 1 (Ej: 9.5)
    p2 DECIMAL(4,2), -- Calificación Parcial 2
    p3 DECIMAL(4,2), -- Calificación Parcial 3
    final_score DECIMAL(4,2), -- Promedio o Calificación final
    is_extraordinary BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- DATOS DE PRUEBA (SEED DATA)
-- ==========================================

-- A. Insertar Usuarios
INSERT INTO users (full_name, email, password, role, matricula) VALUES 
('Admin General', 'admin@uttehuacan.edu.mx', 'admin123', 'admin', 'ADM001'),
('Ing. Juan Pérez', 'juan.perez@uttehuacan.edu.mx', 'profe123', 'teacher', 'EMP001'),
('Lic. Maria Lopez', 'maria.lopez@uttehuacan.edu.mx', 'profe123', 'teacher', 'EMP002'),
('Carlos Estudiante', 'carlos@alumnos.ut.mx', 'alumno123', 'student', 'ALU001'),
('Ana Estudiante', 'ana@alumnos.ut.mx', 'alumno123', 'student', 'ALU002');

-- B. Insertar Periodo
INSERT INTO academic_periods (name, start_date, end_date, is_active) VALUES 
('Enero - Abril 2024', '2024-01-07', '2024-04-30', TRUE);

-- C. Insertar Materias
INSERT INTO subjects (name, career) VALUES 
('Desarrollo de Apps Web', 'TICs'),
('Base de Datos Avanzadas', 'TICs'),
('Matemáticas para Ingeniería', 'Mecatrónica');

-- D. Crear Grupos (El admin asigna materias a profes)
-- El Profe Juan (id 2) dará Apps Web (id 1) al grupo "9A"
INSERT INTO groups (name, subject_id, teacher_id, period_id, classroom) VALUES 
('9A', 1, 2, 1, 'Lab 3'), 
('4B', 3, 3, 1, 'Edificio K');

-- E. Inscribir Alumnos (Carlos en 9A)
INSERT INTO enrollments (student_id, group_id) VALUES 
(4, 1), -- Carlos en Apps Web
(5, 1); -- Ana en Apps Web

-- F. Simular Calificaciones (El profe sube notas)
INSERT INTO grades (enrollment_id, p1, p2) VALUES 
(1, 9.0, 8.5), -- Carlos tiene 9.0 y 8.5
(2, 10.0, 9.5); -- Ana tiene 10.0 y 9.5