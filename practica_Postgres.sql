-- ==========================================================
-- 1. LIMPIEZA TOTAL (Para empezar desde cero y evitar errores)
-- ==========================================================
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS materias CASCADE;

-- ==========================================================
-- 2. CREAR TABLA: USUARIOS
-- ==========================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    clave VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. CREAR TABLA: MATERIAS
-- ==========================================================
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL
);

INSERT INTO materias (codigo, nombre) VALUES 
('SIS-101', 'Fundamentos de Programación'),
('SIS-102', 'Bases de Datos I'),
('SIS-103', 'Desarrollo Backend'),
('MAT-200', 'Cálculo Diferencial'),
('MAT-201', 'Álgebra Lineal'),
('HUM-300', 'Ética Profesional'),
('ENG-100', 'Inglés Técnico I'),
('SIS-400', 'Arquitectura de Software');

-- ==========================================================
-- 5. VERIFICACIÓN FINAL
-- ==========================================================
SELECT * FROM usuarios; 
SELECT * FROM materias;
