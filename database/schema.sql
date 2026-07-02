CREATE DATABASE IF NOT EXISTS sinfoni_db;
USE sinfoni_db;

-- ELIMINACIÓN DE TABLAS PREVIAS (En orden inverso por llaves foráneas para evitar bloqueos)
DROP TABLE IF EXISTS trazabilidad_solicitudes;
DROP TABLE IF EXISTS asignacion_evaluaciones;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS convocatorias;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS sedes;

-- ========================================================
-- CREACIÓN DE ESTRUCTURAS LIMPIAS
-- ========================================================

-- 1. TABLA: SEDES (Independiente)
CREATE TABLE sedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sede VARCHAR(100) NOT NULL
);

-- 2. TABLA: USUARIOS (Aquí se maneja el registro y el login)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,    
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Almacenará hashes de Bcrypt
    rol ENUM('Admin', 'Profesor', 'Evaluador') DEFAULT 'Profesor',
    telefono VARCHAR(20) NULL,       
    direccion VARCHAR(255) NULL,    
    foto_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- 3. TABLA: CONVOCATORIAS (Independiente)
CREATE TABLE convocatorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo ENUM('General', 'Mediana') NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_cierre DATETIME NOT NULL,
    bases_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: SOLICITUDES
CREATE TABLE solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    convocatoria_id INT NOT NULL,
    sede_id INT NOT NULL,
    num_solicitud VARCHAR(50) NOT NULL,
    observaciones TEXT NULL,
    estado ENUM('Borrador', 'Presentado', 'En Evaluacion', 'Aprobado', 'Rechazado') DEFAULT 'Borrador',
    doc_par_1 VARCHAR(255) NULL,
    doc_par_2 VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (convocatoria_id) REFERENCES convocatorias(id) ON DELETE RESTRICT,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE RESTRICT
);

-- 5. TABLA: ASIGNACION_EVALUACIONES
CREATE TABLE asignacion_evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    evaluador_id INT NOT NULL,
    puntaje DECIMAL(5,2) DEFAULT 0.00,
    comentarios TEXT NULL,
    estado_evaluacion ENUM('Asignado', 'En Progreso', 'Finalizado') DEFAULT 'Asignado',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 6. TABLA: TRAZABILIDAD_SOLICITUDES (Auditoría)
CREATE TABLE trazabilidad_solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    usuario_id INT NOT NULL,
    estado_anterior VARCHAR(50) NULL,
    estado_nuevo VARCHAR(50) NOT NULL,
    motivo_cambio TEXT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);
-- 7. TABLA: LOGIN (Donde se validarán estrictamente el correo y la contraseña)
CREATE TABLE IF NOT EXISTS login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ========================================================
-- INSERCIÓN DE DATOS INICIALES Y CUENTAS DE PRUEBA
-- ========================================================

INSERT INTO sedes (nombre_sede) VALUES 
('Pereira'), 
('Ibagué'), 
('Bogotá');

INSERT INTO convocatorias (titulo, tipo, fecha_inicio, fecha_cierre, bases_url) VALUES 
('Recursos de Reposición Convocatorias Internas de Investigación 2026-1', 'General', '2026-06-01 00:00:00', '2026-07-24 23:59:59', '/uploads/bases_2026_1.pdf');

--- Insertar las credenciales de acceso vinculadas a tus usuarios de prueba (Si ya existen no se duplicarán)
INSERT IGNORE INTO login (usuario_id, email, password) VALUES
(1, 'admin@sinfoni.com', '$2b$10$y6R7qZ92M68kYI6kL8wYdeXpDbeX9Z2U3R4h5M6N7O8P2qwErTyUi'),
(2, 'evaluador@sinfoni.com', '$2b$10$y6R7qZ92M68kYI6kL8wYdeXpDbeX9Z2U3R4h5M6N7O8P2qwErTyUi');