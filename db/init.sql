-- ==========================================
-- SCRIPT DE BASE DE DATOS - SGE UT TEHUACÁN
-- VERSIÓN: 2.2 (Sincronizado con Bcrypt y Datos Reales)
-- ==========================================

-- 1. LIMPIEZA
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS group_teachers CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS academic_periods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. TABLA DE USUARIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    matricula VARCHAR(20) UNIQUE, 
    area VARCHAR(100) DEFAULT 'Tronco Común',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE PERIODOS ACADÉMICOS
CREATE TABLE academic_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT FALSE
);

-- 4. TABLA DE MATERIAS
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    credits INT DEFAULT 5
);

-- 5. TABLA DE GRUPOS
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(20) NOT NULL,
    area VARCHAR(100) DEFAULT 'General',
    cuatrimestre INT NOT NULL DEFAULT 1,
    period_id INT REFERENCES academic_periods(id),
    classroom VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA INTERMEDIA: Profesores a Grupos y Materias
CREATE TABLE group_teachers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id),
    UNIQUE(user_id, group_id, subject_id)
);

-- 6. TABLA DE INSCRIPCIONES (Alumnos)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id)
);

-- 7. TABLA DE CALIFICACIONES
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    p1 DECIMAL(4,2) DEFAULT 0,
    p2 DECIMAL(4,2) DEFAULT 0,
    p3 DECIMAL(4,2) DEFAULT 0,
    final_score DECIMAL(4,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, subject_id)
);

-- ==========================================
-- DATOS DE PRUEBA (HASHES ORIGINALES MANTENIDOS)
-- ==========================================

INSERT INTO users (full_name, email, password, role, matricula, area) VALUES 
-- ADMINISTRADOR
('Admin General UT', 'admin@uttehuacan.edu.mx', '$2b$10$9lj1xZkp9DG4zuWeQLHT5.eDEcySaiDUKI4C3a6nIVDa3kQ8VR6HS', 'admin', 'ADM001', 'Administración'),

-- PROFESORES (Reutilizando el hash de Maria Lopez para los nuevos profes)
('Ing. Juan Pérez', 'juan.perez@uttehuacan.edu.mx', '$2b$10$vifci8Qw6kYS6L.hJ2Ytvu/qbNH48.nTivN/PnAhom4AGaPkTi.2O', 'teacher', 'DOC001', 'Tecnologías de la Información'),
('Lic. Maria Lopez', 'maria.g@uttehuacan.edu.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'teacher', 'DOC002', 'Ciencias Básicas'),
('Mtro. Roberto Díaz', 'roberto.d@uttehuacan.edu.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'teacher', 'DOC003', 'Mecatrónica'),
('Ing. Patricia Cruz', 'patricia.cruz@uttehuacan.edu.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'teacher', 'DOC004', 'Tecnologías de la Información'),

-- ALUMNOS (Reutilizando el hash de Ana Torres para los nuevos alumnos)
('German', 'geryiman0@alumnos.ut.mx', '$2b$10$LxoOeg8GQxVgLob2l5O9QeHUZMVHwbG3EsHu7XgGJZSOTG9Pt/nYu', 'student', 'ALU23001', 'Desarrollo de Software'),
('Ana Torres', 'ana@alumnos.ut.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'student', 'ALU23002', 'Desarrollo de Software'),
('Luis Rodríguez', 'luis.r@alumnos.ut.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'student', 'ALU23003', 'Desarrollo de Software'),
('Sofía Martínez', 'sofia.m@alumnos.ut.mx', '$2b$10$Un8p3AtH/C.FshM7vVclvO9N6.V67mN.q0DCC.7BvYhXhZ9/z8V6G', 'student', 'ALU24001', 'Mecatrónica');

-- Insertar Periodos Reales
INSERT INTO academic_periods (name, start_date, end_date, is_active) VALUES 
('Septiembre - Diciembre 2023', '2023-09-01', '2023-12-15', FALSE),
('Enero - Abril 2024', '2024-01-07', '2024-04-30', TRUE);

-- Insertar Materias Reales (Basadas en UT)
INSERT INTO subjects (name, credits) VALUES 
('Aplicaciones Web', 6),
('Base de Datos para Aplicaciones', 5),
('Álgebra Lineal', 5),
('Inglés IV', 4),
('Sistemas Operativos', 4),
('Física Industrial', 5);

-- Crear Grupos Estilo UT (TI = Tecnologías de la Info, MEC = Mecatrónica)
INSERT INTO groups (group_name, cuatrimestre, area, period_id, classroom) VALUES 
('TI-41', 4, 'Desarrollo de Software', 2, 'Lab Cómputo C-2'), 
('MEC-21', 2, 'Mecatrónica', 2, 'Edificio K-201'),
('TI-11', 1, 'Desarrollo de Software', 2, 'Edificio D-105');

-- Asignar Profesores a Grupos y MATERIAS
-- Juan Pérez (2) enseña Aplicaciones Web (1) a TI-41 (1)
INSERT INTO group_teachers (user_id, group_id, subject_id) VALUES (2, 1, 1);
-- Patricia Cruz (5) enseña Base de Datos (2) a TI-41 (1)
INSERT INTO group_teachers (user_id, group_id, subject_id) VALUES (5, 1, 2);
-- Maria Lopez (3) enseña Álgebra Lineal (3) a MEC-21 (2)
INSERT INTO group_teachers (user_id, group_id, subject_id) VALUES (3, 2, 3);

-- Inscribir Alumnos
-- TI-41: German (6), Ana Torres (7), Luis Rodríguez (8)
INSERT INTO enrollments (student_id, group_id) VALUES (6, 1), (7, 1), (8, 1);
-- MEC-21: Sofía Martínez (9)
INSERT INTO enrollments (student_id, group_id) VALUES (9, 2);

-- Insertar un par de calificaciones de ejemplo para German en TI-41 (Enrollment ID = 1)
-- Aplicaciones Web (Subject 1)
INSERT INTO grades (enrollment_id, subject_id, p1, p2, p3, final_score) 
VALUES (1, 1, 8.5, 9.0, 0, 5.8); -- Parcial 3 aún no evaluado