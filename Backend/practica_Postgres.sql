-- ==========================================================
-- 1. LIMPIEZA TOTAL
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

-- ==========================================================
-- 4. INSERTAR USUARIOS
-- ==========================================================
INSERT INTO usuarios (cedula, nombre, clave) VALUES 
('1750000001', 'Juan Zambrano', 'admin2025'),
('1750000002', 'Maria Perez', 'segura123'),
('1750000003', 'Carlos Lopez', 'futbol10'),
('1750000004', 'Ana Torres', 'gatos4life'),
('1750000005', 'Luis Gomez', '123456'),
('1750000006', 'Sofia Ramirez', 'password'),
('1750000007', 'Diego Herrera', 'ecuador2025'),
('1750000008', 'Valeria Castillo', 'valebendecida'),
('1750000009', 'Jose Intriago', 'barcelonaSC'),
('1750000010', 'Elena Velez', 'profe123');

-- ==========================================================
-- 5. INSERTAR MATERIAS
-- ==========================================================
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
-- 6. VERIFICACIÓN FINAL
-- ==========================================================
SELECT * FROM usuarios;
SELECT * FROM materias;