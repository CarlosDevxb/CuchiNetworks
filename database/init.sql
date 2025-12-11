-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: db-cuchinetworks.c1cwo4yws5ax.us-east-2.rds.amazonaws.com    Database: cuchi_networks_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `cuchi_networks_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `cuchi_networks_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `cuchi_networks_db`;

--
-- Table structure for table `Administradores`
--

DROP TABLE IF EXISTS `Administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Administradores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nombre_completo` varchar(255) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `Administradores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Administradores`
--

LOCK TABLES `Administradores` WRITE;
/*!40000 ALTER TABLE `Administradores` DISABLE KEYS */;
INSERT INTO `Administradores` VALUES (1,1,'Eduardo Valdivia','Super Admin');
/*!40000 ALTER TABLE `Administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Alumnos`
--

DROP TABLE IF EXISTS `Alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Alumnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nombre_completo` varchar(255) NOT NULL,
  `matricula` varchar(50) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `semestre` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `Alumnos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Alumnos`
--

LOCK TABLES `Alumnos` WRITE;
/*!40000 ALTER TABLE `Alumnos` DISABLE KEYS */;
INSERT INTO `Alumnos` VALUES (1,2,'Javier Gaitan','21000123','Ing. Sistemas Computacionales',1);
/*!40000 ALTER TABLE `Alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BitacoraDispositivos`
--

DROP TABLE IF EXISTS `BitacoraDispositivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BitacoraDispositivos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bitacora_id` int NOT NULL,
  `equipo_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bitacora_id` (`bitacora_id`),
  KEY `equipo_id` (`equipo_id`),
  CONSTRAINT `BitacoraDispositivos_ibfk_1` FOREIGN KEY (`bitacora_id`) REFERENCES `BitacoraUso` (`id`) ON DELETE CASCADE,
  CONSTRAINT `BitacoraDispositivos_ibfk_2` FOREIGN KEY (`equipo_id`) REFERENCES `Equipos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BitacoraDispositivos`
--

LOCK TABLES `BitacoraDispositivos` WRITE;
/*!40000 ALTER TABLE `BitacoraDispositivos` DISABLE KEYS */;
INSERT INTO `BitacoraDispositivos` VALUES (1,2,3),(3,4,3);
/*!40000 ALTER TABLE `BitacoraDispositivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BitacoraUso`
--

DROP TABLE IF EXISTS `BitacoraUso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BitacoraUso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `materia_id` int NOT NULL,
  `tipo_clase` enum('teorica','practica') NOT NULL DEFAULT 'teorica',
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `hora_entrada` time NOT NULL,
  `hora_salida` time NOT NULL,
  `tema_visto` varchar(255) DEFAULT NULL,
  `observaciones` text,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `materia_id` (`materia_id`),
  CONSTRAINT `BitacoraUso_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `BitacoraUso_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `Materias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BitacoraUso`
--

LOCK TABLES `BitacoraUso` WRITE;
/*!40000 ALTER TABLE `BitacoraUso` DISABLE KEYS */;
INSERT INTO `BitacoraUso` VALUES (1,3,3,'teorica','2025-11-25 00:04:18','08:00:00','10:00:00','Configuracin de VLANs','Todo en orden'),(2,3,3,'practica','2025-11-25 21:21:03','08:00:00','09:00:00','Enrutamiento EIGRP','Ninguna inicdencia en el transcurso'),(4,3,3,'practica','2025-12-09 18:52:53','10:00:00','11:00:00','PRACTICA EIGRP','ANGOSTURA TRONO EL SWITCH Y ROUTER');
/*!40000 ALTER TABLE `BitacoraUso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Clases`
--

DROP TABLE IF EXISTS `Clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Clases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `docente_id` int NOT NULL,
  `materia_id` int NOT NULL,
  `grupo` varchar(10) NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `docente_id` (`docente_id`),
  KEY `materia_id` (`materia_id`),
  CONSTRAINT `Clases_ibfk_1` FOREIGN KEY (`docente_id`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Clases_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `Materias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Clases`
--

LOCK TABLES `Clases` WRITE;
/*!40000 ALTER TABLE `Clases` DISABLE KEYS */;
INSERT INTO `Clases` VALUES (1,3,2,'B','Lunes','10:00:00','11:00:00'),(2,3,2,'B','Viernes','10:00:00','11:00:00'),(3,3,2,'B','Jueves','10:00:00','11:00:00'),(4,3,2,'B','Miercoles','10:00:00','11:00:00'),(5,3,2,'B','Martes','10:00:00','11:00:00');
/*!40000 ALTER TABLE `Clases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Componentes`
--

DROP TABLE IF EXISTS `Componentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Componentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipo_id` int NOT NULL,
  `tipo_componente` varchar(50) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `numero_serie_componente` varchar(100) DEFAULT NULL,
  `estado` enum('operativo','falla') NOT NULL DEFAULT 'operativo',
  PRIMARY KEY (`id`),
  KEY `equipo_id` (`equipo_id`),
  CONSTRAINT `Componentes_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `Equipos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Componentes`
--

LOCK TABLES `Componentes` WRITE;
/*!40000 ALTER TABLE `Componentes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Componentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DocenteMaterias`
--

DROP TABLE IF EXISTS `DocenteMaterias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DocenteMaterias` (
  `docente_id` int NOT NULL,
  `materia_id` int NOT NULL,
  PRIMARY KEY (`docente_id`,`materia_id`),
  KEY `materia_id` (`materia_id`),
  CONSTRAINT `DocenteMaterias_ibfk_1` FOREIGN KEY (`docente_id`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `DocenteMaterias_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `Materias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DocenteMaterias`
--

LOCK TABLES `DocenteMaterias` WRITE;
/*!40000 ALTER TABLE `DocenteMaterias` DISABLE KEYS */;
INSERT INTO `DocenteMaterias` VALUES (3,1),(3,2),(4,3),(17,3),(4,4);
/*!40000 ALTER TABLE `DocenteMaterias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Docentes`
--

DROP TABLE IF EXISTS `Docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Docentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nombre_completo` varchar(255) NOT NULL,
  `numero_empleado` varchar(50) DEFAULT NULL,
  `titulo_academico` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `Docentes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Docentes`
--

LOCK TABLES `Docentes` WRITE;
/*!40000 ALTER TABLE `Docentes` DISABLE KEYS */;
INSERT INTO `Docentes` VALUES (1,3,'Sergio Mendoza Morales','DOC-003','Ing.'),(2,4,'Jose Juan Mares Davila','DOC-004','Lic.'),(3,16,'Javier Angostura','DOC-016','Ing.'),(4,17,'Omar Sanchez Jacome','DOC-017','Dr.');
/*!40000 ALTER TABLE `Docentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Equipos`
--

DROP TABLE IF EXISTS `Equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Equipos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ubicacion_id` int DEFAULT NULL,
  `nombre_equipo` varchar(100) NOT NULL,
  `tipo` enum('computadora','router','switch','servidor','impresora','monitor','otro') NOT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `estado` enum('operativo','falla','mantenimiento','inactivo') NOT NULL DEFAULT 'operativo',
  `imagen_url` varchar(512) DEFAULT NULL,
  `posicion_fisica` varchar(50) DEFAULT NULL,
  `detalles` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `ubicacion_id` (`ubicacion_id`),
  CONSTRAINT `Equipos_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `Ubicaciones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Equipos`
--

LOCK TABLES `Equipos` WRITE;
/*!40000 ALTER TABLE `Equipos` DISABLE KEYS */;
INSERT INTO `Equipos` VALUES (1,1,'R1-isla1','router','Cisco 1841','345654','operativo',NULL,NULL,'{\"cables\": {\"consola\": true, \"corriente\": true}, \"interfaces\": {\"serial\": \"2\", \"gigabit\": 0, \"fastEthernet\": \"2\"}}'),(2,2,'PC-1','computadora','Dell 1892','2434142','mantenimiento',NULL,NULL,'{\"hardware\": {\"ram\": \"8GB\", \"procesador\": \"intel i5\"}, \"perifericos\": {\"mouse\": true, \"monitor\": true, \"teclado\": true}}'),(3,3,'R2-Isla2','router','Cisco 1841','23454','operativo',NULL,NULL,'{\"cables\": {\"consola\": true, \"corriente\": true}, \"interfaces\": {\"serial\": \"2\", \"gigabit\": 0, \"fastEthernet\": \"2\"}}'),(6,2,'Pc2','computadora','Dell','2345423','operativo',NULL,NULL,'{\"hardware\": {\"ram\": \"8\", \"procesador\": \"Ryzen 3\"}, \"perifericos\": {\"mouse\": true, \"monitor\": true, \"teclado\": true}}'),(8,1,'R-1','router','Cisco 1841','23424','operativo','http://localhost:3000/uploads/equipo-1765318194473-792075808.png','R2','{\"cables\": {\"consola\": true, \"corriente\": true}, \"interfaces\": {\"serial\": \"02\", \"gigabit\": \"02\", \"fastEthernet\": \"02\"}}');
/*!40000 ALTER TABLE `Equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Materias`
--

DROP TABLE IF EXISTS `Materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Materias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `semestre` varchar(50) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Materias`
--

LOCK TABLES `Materias` WRITE;
/*!40000 ALTER TABLE `Materias` DISABLE KEYS */;
INSERT INTO `Materias` VALUES (1,'Redes De computadora','5','Ingeniería en Sistemas Computacionales'),(2,'Conmutacion Y Enrutamiento en Redes de Datos','6','Ingeniería en Sistemas Computacionales'),(3,'Administracion De Redes','7','Ingeniería en Sistemas Computacionales'),(4,'Fundamentos de Telecomunicaciones','4','Ingeniería en Sistemas Computacionales'),(7,'Habilidades DevOps','6','Ingeniería en Sistemas Computacionales');
/*!40000 ALTER TABLE `Materias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Proveedores`
--

DROP TABLE IF EXISTS `Proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(255) NOT NULL,
  `contacto_nombre` varchar(150) DEFAULT NULL,
  `contacto_email` varchar(150) DEFAULT NULL,
  `contacto_telefono` varchar(50) DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_empresa` (`nombre_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Proveedores`
--

LOCK TABLES `Proveedores` WRITE;
/*!40000 ALTER TABLE `Proveedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `Proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reportes`
--

DROP TABLE IF EXISTS `Reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reportes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `equipo_id` int DEFAULT NULL,
  `ubicacion_id` int DEFAULT NULL,
  `proveedor_id` int DEFAULT NULL,
  `estado_reporte` enum('nuevo','en_revision','esperando_autorizacion','en_reparacion_externa','esperando_refaccion','resuelto','dado_de_baja') NOT NULL DEFAULT 'nuevo',
  `descripcion_problema` text NOT NULL,
  `notas_admin` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `bitacora_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `equipo_id` (`equipo_id`),
  KEY `ubicacion_id` (`ubicacion_id`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `bitacora_id` (`bitacora_id`),
  CONSTRAINT `Reportes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `Usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Reportes_ibfk_2` FOREIGN KEY (`equipo_id`) REFERENCES `Equipos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Reportes_ibfk_3` FOREIGN KEY (`ubicacion_id`) REFERENCES `Ubicaciones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Reportes_ibfk_4` FOREIGN KEY (`proveedor_id`) REFERENCES `Proveedores` (`id`) ON DELETE SET NULL,
  CONSTRAINT `Reportes_ibfk_5` FOREIGN KEY (`bitacora_id`) REFERENCES `BitacoraUso` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reportes`
--

LOCK TABLES `Reportes` WRITE;
/*!40000 ALTER TABLE `Reportes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Reportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TokenBlacklist`
--

DROP TABLE IF EXISTS `TokenBlacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TokenBlacklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(512) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TokenBlacklist`
--

LOCK TABLES `TokenBlacklist` WRITE;
/*!40000 ALTER TABLE `TokenBlacklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `TokenBlacklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ubicaciones`
--

DROP TABLE IF EXISTS `Ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ubicaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `tipo_zona` enum('isla','mesa_central','bodega','otro') NOT NULL DEFAULT 'otro',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ubicaciones`
--

LOCK TABLES `Ubicaciones` WRITE;
/*!40000 ALTER TABLE `Ubicaciones` DISABLE KEYS */;
INSERT INTO `Ubicaciones` VALUES (1,'Isla 4','Lado izquierdo','isla'),(2,'Mesa Central','Mesa al centro del laboratorio','mesa_central'),(3,'Isla 2','Isla de trabajo #2 lado izquierdo','isla'),(4,'Isla 1','alch ni se que pedo','isla');
/*!40000 ALTER TABLE `Ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Usuarios`
--

DROP TABLE IF EXISTS `Usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','alumno','docente') NOT NULL DEFAULT 'alumno',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `horario_entrada` time DEFAULT NULL,
  `horario_salida` time DEFAULT NULL,
  `estatus` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Usuarios`
--

LOCK TABLES `Usuarios` WRITE;
/*!40000 ALTER TABLE `Usuarios` DISABLE KEYS */;
INSERT INTO `Usuarios` VALUES (1,'Eduardo Valdivia Lugo','eduardo.valdivia.lugo@cuchi.net','$2b$10$/FwDBYQ8.txULNk04Sh.Gex2VX0sMb8zq84Y6Edwf7fYBW4tHFlfK','admin','2025-11-24 00:13:33',NULL,NULL,'activo'),(2,'Javier Gaitan','javier.gaitan@cuchi.net','$2b$10$09Npfs4X1JVDV4mLvzH0Le3Y44NyY4efxKLBKy7JhfjNy2ywgeexS','alumno','2025-11-24 00:31:21',NULL,NULL,'inactivo'),(3,'Sergio Mendoza Morales','ositoBimbo@cuchi.net','$2b$10$8C0iefHUfR14t1yfx5V4EegoSE6VRcVK4vh6sgLdS.01WLdPy57WO','docente','2025-11-24 17:08:06','09:00:00','18:00:00','activo'),(4,'Jose Juan Mares Davila','jose.davila@cuchi.net','$2b$10$hHXoyUbNXIUQH72/2/.w..P5vYNAY7kmYrESE3ehAIcaWGBq5ORY2','docente','2025-11-26 00:11:27','10:00:00','11:00:00','activo'),(16,'Javier Angostura','javier@cuchi.net','$2b$10$XwyVATMU0M/tYcrh3p46Qe.6m93XfMwsZl4oqiv9JbkVNZRkkiYLW','docente','2025-11-26 00:20:50','10:00:00','17:00:00','activo'),(17,'Omar Sanchez Jacome','jacum@cuchi.net','$2b$10$cm34IlDkO.grKU.6HArlcuGNVhosiuHQNC9dg6G0lWu2o27rflyfy','docente','2025-11-26 00:28:53','10:00:00','11:00:00','inactivo');
/*!40000 ALTER TABLE `Usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-10 22:03:07
