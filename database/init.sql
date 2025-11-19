

DROP TABLE IF EXISTS Componentes;

DROP TABLE IF EXISTS Reportes;

DROP TABLE IF EXISTS HorariosAula;

DROP TABLE IF EXISTS Equipos;

DROP TABLE IF EXISTS Proveedores; -- <-- NUEVO

DROP TABLE IF EXISTS Usuarios;

DROP TABLE IF EXISTS Ubicaciones;

DROP TRIGGER IF EXISTS trg_reportes_check_before_insert;

DROP TRIGGER IF EXISTS trg_reportes_check_before_update;



-- -----------------------------------------------------------------

-- PASO 1: Tablas sin dependencias (Maestras)

-- -----------------------------------------------------------------


CREATE TABLE Ubicaciones (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE, -- Ej: "Mesa 1", "Rack A", "Almacén"

    descripcion TEXT NULL

) ENGINE=InnoDB;


CREATE TABLE Usuarios (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    rol ENUM('admin', 'alumno') NOT NULL DEFAULT 'alumno'

) ENGINE=InnoDB;


-- NUEVA TABLA: Para gestionar proveedores de servicio externo

CREATE TABLE Proveedores (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre_empresa VARCHAR(255) NOT NULL UNIQUE,

    contacto_nombre VARCHAR(150) NULL,

    contacto_email VARCHAR(150) NULL,

    contacto_telefono VARCHAR(50) NULL,

    notas TEXT NULL

) ENGINE=InnoDB;



-- -----------------------------------------------------------------

-- PASO 2: Tablas que dependen del PASO 1

-- -----------------------------------------------------------------


CREATE TABLE Equipos (

    id INT AUTO_INCREMENT PRIMARY KEY,

    ubicacion_id INT NULL,

    nombre_equipo VARCHAR(100) NOT NULL,

    tipo ENUM('computadora', 'router', 'switch', 'otro') NOT NULL,

    modelo VARCHAR(100) NULL,

    numero_serie VARCHAR(100) UNIQUE NULL,

    estado ENUM('operativo', 'falla', 'mantenimiento') NOT NULL DEFAULT 'operativo',

    foto_url VARCHAR(512) NULL,

    notas_internas TEXT NULL,

    

    FOREIGN KEY (ubicacion_id) 

        REFERENCES Ubicaciones(id) 

        ON DELETE SET NULL

) ENGINE=InnoDB;


CREATE TABLE HorariosAula (

    id INT AUTO_INCREMENT PRIMARY KEY,

    admin_id INT NULL,

    materia_o_evento VARCHAR(255) NOT NULL,

    fecha_inicio DATETIME NOT NULL,

    fecha_fin DATETIME NOT NULL,

    

    FOREIGN KEY (admin_id) 

        REFERENCES Usuarios(id) 

        ON DELETE SET NULL

) ENGINE=InnoDB;



-- -----------------------------------------------------------------

-- PASO 3: Tablas que dependen del PASO 2

-- -----------------------------------------------------------------


CREATE TABLE Componentes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    equipo_id INT NOT NULL,

    tipo_componente VARCHAR(50) NOT NULL,

    descripcion VARCHAR(255) NOT NULL,

    numero_serie_componente VARCHAR(100) NULL,

    estado ENUM('operativo', 'falla') NOT NULL DEFAULT 'operativo',

    

    FOREIGN KEY (equipo_id) 

        REFERENCES Equipos(id) 

        ON DELETE CASCADE

) ENGINE=InnoDB;



-- -----------------------------------------------------------------

-- PASO 4: Tabla 'Reportes' (Modificada)

-- Esta es la tabla con más cambios.

-- -----------------------------------------------------------------


CREATE TABLE Reportes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NULL,           -- Quién reportó

    equipo_id INT NULL,            -- Falla en un equipo

    ubicacion_id INT NULL,         -- Falla en una mesa

    

    -- --- CAMPOS MODIFICADOS ---

    estado_reporte ENUM(

        'nuevo',                   -- Reportado por alumno, pendiente de revisión

        'en_revision',             -- Admin/auxiliar está diagnosticando

        'esperando_autorizacion',  -- Esperando oficio/firma de Jefatura

        'en_reparacion_externa',   -- Enviado a proveedor (El admin quiere ver esto)

        'esperando_refaccion',     -- Cuello de botella de mantenimiento (pago/pieza)

        'resuelto',                -- Reparado y devuelto

        'dado_de_baja'             -- Cerrado como no reparable (baja de activo fijo)

    ) NOT NULL DEFAULT 'nuevo',

    

    -- --- NUEVOS CAMPOS ---

    proveedor_id INT NULL,         -- Clave foránea a la nueva tabla Proveedores

    costo_presupuesto DECIMAL(10, 2) NULL, -- Para el presupuesto

    estado_pago ENUM(

        'no_aplica',

        'pendiente',

        'pagado'

    ) NOT NULL DEFAULT 'no_aplica',

    

    -- --- CAMPOS ORIGINALES ---

    descripcion_problema TEXT NOT NULL,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    notas_admin TEXT NULL,         -- Solución o seguimiento del admin

    

    -- --- CLAVES FORÁNEAS ---

    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE SET NULL,

    FOREIGN KEY (equipo_id) REFERENCES Equipos(id) ON DELETE SET NULL,

    FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id) ON DELETE SET NULL,

    FOREIGN KEY (proveedor_id) REFERENCES Proveedores(id) ON DELETE SET NULL -- <-- NUEVA FK

    

) ENGINE=InnoDB;



-- -----------------------------------------------------------------

-- PASO 5: Triggers (Validación de Lógica de Negocio)

-- Sigue siendo necesario para la tabla Reportes.

-- -----------------------------------------------------------------


DELIMITER $$

CREATE TRIGGER trg_reportes_check_before_insert

BEFORE INSERT ON Reportes

FOR EACH ROW

BEGIN

    IF NEW.equipo_id IS NULL AND NEW.ubicacion_id IS NULL THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Error: El reporte debe estar asociado a un equipo_id o a un ubicacion_id.';

    END IF;

END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER trg_reportes_check_before_update

BEFORE UPDATE ON Reportes

FOR EACH ROW

BEGIN

    IF NEW.equipo_id IS NULL AND NEW.ubicacion_id IS NULL THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Error: El reporte debe estar asociado a un equipo_id o a un ubicacion_id.';

    END IF;

END$$

DELIMITER ;


-- -----------------------------------------------------------------

-- FIN DEL SCRIPT v2

-- ----------------------------------------------------------------- 
