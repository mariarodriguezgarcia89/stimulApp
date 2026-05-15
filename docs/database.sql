DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS estadisticas_usuario;
DROP TABLE IF EXISTS partidas;
DROP TABLE IF EXISTS juegos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS refranes;
DROP TABLE IF EXISTS intrusos;

CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255),
    apellidos VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    fecha_nacimiento DATETIME,
    foto_perfil VARCHAR(255),
    email_cuidador VARCHAR(255),
    nombre_cuidador VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

CREATE TABLE juegos (
    id_juego INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255),
    descripcion TEXT,
    categoria_cognitiva VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

CREATE TABLE partidas (
    id_partida INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    juego_id INT,
    nivel ENUM('facil','medio','dificil') NOT NULL,
    puntuacion INT NOT NULL,
    duracion_segundos INT NOT NULL,
    completada BOOLEAN NOT NULL,
    fecha DATETIME NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (juego_id) REFERENCES juegos(id_juego) ON DELETE CASCADE
);

CREATE TABLE estadisticas_usuario (
    id_estadisticas INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    juego_id INT NOT NULL,
    mejor_puntuacion INT NOT NULL,
    total_partidas INT NOT NULL,
    puntuacion_media DECIMAL(6,2) NOT NULL,
    ultima_partida DATETIME NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (juego_id) REFERENCES juegos(id_juego) ON DELETE CASCADE
);

CREATE TABLE tokens (
    id_tokens INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    token VARCHAR(255) UNIQUE,
    expira_en DATETIME NOT NULL,
    usado BOOLEAN DEFAULT false,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE refranes (
    id_refran INT PRIMARY KEY AUTO_INCREMENT,
    primera_parte VARCHAR(255) NOT NULL,
    opcion_uno VARCHAR(255) NOT NULL,
    opcion_dos VARCHAR(255) NOT NULL,
    opcion_correcta VARCHAR(255) NOT NULL
);

CREATE TABLE intrusos (
    id_intruso INT PRIMARY KEY AUTO_INCREMENT,
    imagen_uno VARCHAR(255) NOT NULL,
    imagen_dos VARCHAR(255) NOT NULL,
    imagen_tres VARCHAR(255) NOT NULL,
    imagen_cuatro VARCHAR(255) NOT NULL,
    imagen_intrusa VARCHAR(255) NOT NULL,
    nivel VARCHAR(10) NOT NULL,
    explicacion VARCHAR(500) NOT NULL
);