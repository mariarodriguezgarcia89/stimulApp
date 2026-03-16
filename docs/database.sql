DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS estadisticas_usuario;
DROP TABLE IF EXISTS partidas;
DROP TABLE IF EXISTS juegos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    apellidos VARCHAR(150),
    email VARCHAR(150) UNIQUE, -- login
    password_hash VARCHAR(255), -- bcrypt
    fecha_nacimiento DATE,
    foto_perfil VARCHAR(255), -- ruta o null
    email_cuidador VARCHAR(150), -- para alertas
    nombre_cuidador VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at DATETIME
);

CREATE TABLE juegos(
    id_juego INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100), -- "Memory", "Acaba el refrán", "Encuentra el intruso"
    descripcion TEXT,
    categoria_cognitiva VARCHAR(100), -- "memoria visual", "lenguaje", "atención"
    activo BOOLEAN DEFAULT true
);

CREATE TABLE partidas(
    id_partida INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    juego_id INT,req
    nivel ENUM('facil','medio','dificil'),
    puntuacion INT,
    duracion_segundos INT,
    completada BOOLEAN, -- si terminó o abandonó
    fecha DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (juego_id) REFERENCES juegos(id_juego)
);

CREATE TABLE estadisticas_usuario(
    id_estadisticas INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    juego_id INT,
    mejor_puntuacion INT,
    total_partidas INT,
    puntuacion_media DECIMAL(6,2),
    ultima_partida DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (juego_id) REFERENCES juegos(id_juego)
);

CREATE TABLE tokens(
    id_tokens INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    token VARCHAR(255) UNIQUE, 
    expira_en DATETIME,
    usado BOOLEAN DEFAULT false,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
);