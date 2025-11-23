-- -----------------------------------------------------------------
-- SCRIPT DE INICIALIZACIÓN (SOLO ESTRUCTURA) - CUCHINETWORKS v3.0
-- -----------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. LIMPIEZA
DROP TABLE IF EXISTS BitacoraUso;
DROP TABLE IF EXISTS Reportes;
DROP TABLE IF EXISTS Componentes;
DROP TABLE IF EXISTS Equipos;
DROP TABLE IF EXISTS Materias;
DROP TABLE IF EXISTS Proveedores;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Ubicaciones;

-- 2. TABLAS MAESTRAS
CREATE TABLE Ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    tipo_zona ENUM('isla', 'mesa_central', 'bodega', 'otro') NOT NULL DEFAULT 'otro'
) ENGINE=InnoDB;

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'alumno', 'docente') NOT NULL DEFAULT 'alumno',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(255) NOT NULL UNIQUE,
    contacto_nombre VARCHAR(150) NULL,
    contacto_email VARCHAR(150) NULL,
    contacto_telefono VARCHAR(50) NULL,
    notas TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE Materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    semestre VARCHAR(50) NULL,
    carrera VARCHAR(100) NULL
) ENGINE=InnoDB;

-- 3. TABLAS PRINCIPALES
CREATE TABLE Equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ubicacion_id INT NULL,
    nombre_equipo VARCHAR(100) NOT NULL,
    tipo ENUM('computadora', 'router', 'switch', 'servidor', 'impresora', 'monitor', 'otro') NOT NULL,
    modelo VARCHAR(100) NULL,
    serial_number VARCHAR(100) UNIQUE NULL,
    estado ENUM('operativo', 'falla', 'mantenimiento', 'inactivo') NOT NULL DEFAULT 'operativo',
    imagen_url VARCHAR(512) NULL,
    posicion_fisica VARCHAR(50) NULL,
    detalles JSON NULL,
    FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Componentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NOT NULL,
    tipo_componente VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    numero_serie_componente VARCHAR(100) NULL,
    estado ENUM('operativo', 'falla') NOT NULL DEFAULT 'operativo',
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TABLAS DE GESTIÓN
CREATE TABLE Reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    equipo_id INT NULL,
    ubicacion_id INT NULL,
    proveedor_id INT NULL,
    estado_reporte ENUM('nuevo', 'en_revision', 'esperando_autorizacion', 'en_reparacion_externa', 'esperando_refaccion', 'resuelto', 'dado_de_baja') NOT NULL DEFAULT 'nuevo',
    descripcion_problema TEXT NOT NULL,
    notas_admin TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE SET NULL,
    FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (proveedor_id) REFERENCES Proveedores(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE BitacoraUso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    materia_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    tema_visto VARCHAR(255) NULL,
    observaciones TEXT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES Materias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. TRIGGERS
DELIMITER $$
CREATE TRIGGER trg_reportes_check_insert
BEFORE INSERT ON Reportes
FOR EACH ROW
BEGIN
    IF NEW.equipo_id IS NULL AND NEW.ubicacion_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El reporte debe estar asociado a un equipo o ubicación.';
    END IF;
END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;