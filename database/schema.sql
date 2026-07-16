CREATE DATABASE IF NOT EXISTS sinfoni_db;
USE sinfoni_db;

-- ========================================================
-- LIMPIEZA DE TABLAS EXISTENTES
-- ========================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS documentos_solicitud;
DROP TABLE IF EXISTS participaciones;
DROP TABLE IF EXISTS documentos_proyecto;
DROP TABLE IF EXISTS proyectos_participantes;
DROP TABLE IF EXISTS proyectos;
DROP TABLE IF EXISTS noticias;
DROP TABLE IF EXISTS login;
DROP TABLE IF EXISTS trazabilidad_solicitudes;
DROP TABLE IF EXISTS asignacion_evaluaciones;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS convocatorias;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS sedes;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- CREACIÓN DE ESTRUCTURAS LIMPIAS Y OPTIMIZADAS
-- ========================================================

-- 1. TABLA: SEDES
CREATE TABLE sedes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_sede VARCHAR(100) UNIQUE NOT NULL
);

-- 2. TABLA: USUARIOS (Rol corregido a 'Docente' para sincronía con React)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,  
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('Admin', 'Docente', 'Evaluador') DEFAULT 'Docente',
  telefono VARCHAR(20) NULL,    
  direccion VARCHAR(255) NULL,  
  foto_url VARCHAR(255) NULL,
  nivel_educativo VARCHAR(100) NULL,
  carrera_titulo VARCHAR(150) NULL,
  certificado_url VARCHAR(255) NULL,
  fecha_nacimiento DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: CONVOCATORIAS
CREATE TABLE convocatorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  tipo ENUM('General', 'Mediana') NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_cierre DATETIME NOT NULL,
  presupuesto_max VARCHAR(100) NULL,
  modalidad VARCHAR(100) NULL,
  area_tematica VARCHAR(100) NULL,
  bases_url VARCHAR(500) NULL,
  plantillas_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: SOLICITUDES (Estructura final con URLs de PDFs nativos y estados de SINFONI)
CREATE TABLE solicitudes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  convocatoria_id INT NOT NULL,
  sede_id INT NOT NULL,
  num_solicitud VARCHAR(50) NOT NULL,
  titulo_propuesta VARCHAR(255) NOT NULL,
  observaciones TEXT NULL,
  estado ENUM('Borrador', 'Radicado', 'En Evaluación', 'Aprobado', 'Rechazado') NOT NULL DEFAULT 'Borrador',
  motivo_decision TEXT NULL,
  doc_par_1 VARCHAR(255) NULL,
  doc_par_2 VARCHAR(255) NULL,
  presupuesto_url VARCHAR(255) NULL,
  cronograma_url VARCHAR(255) NULL,
  honestidad_url VARCHAR(255) NULL,
  id_url VARCHAR(255) NULL,
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

-- 6. TABLA: TRAZABILIDAD_SOLICITUDES
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

-- 7. TABLA: LOGIN
CREATE TABLE login (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 8. TABLA: NOTICIAS
CREATE TABLE noticias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NULL,
  archivo_url VARCHAR(255) NULL,
  fecha DATE NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. TABLA: DOCUMENTOS_SOLICITUD
CREATE TABLE documentos_solicitud (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitud_id INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_documento ENUM('Presupuesto', 'Cronograma', 'Honestidad', 'Identidad', 'Otros') NOT NULL, 
  archivo_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE
);

-- ========================================================
-- PARAMETRIZACIÓN INICIAL REQUERIDA
-- ========================================================
INSERT INTO sedes (nombre_sede) VALUES 
('Apartadó'),
('Arauca'),
('Barrancabermeja'),
('Bogotá'),
('Bucaramanga'),
('Cali'),
('Cartago'),
('El Espinal'),
('Ibagué'),
('Medellín'),
('Montería'),
('Neiva'),
('Pasto'),
('Pereira'),
('Popayán'),
('Quibdó'),
('Santa Marta'),
('Villavicencio');