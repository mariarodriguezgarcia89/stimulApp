const { sequelize, Usuario, Juego, Partida, Estadistica } = require("../models/index.js");
const bcryptjs = require('bcryptjs');

async function seed() {
  try {

    //Crear los juegos de prueba
    const juegosData = [
      { nombre: 'Acaba el refrán', descripcion: "Completa refranes populares españoles y ejercita tu memoria semántica", categoria_cognitiva: 'Lenguaje / memoria semántica', activo: true },
      { nombre: 'Encuentra el intruso', descripcion: "Identifica el elemento que no pertenece al grupo y entrena tu atención", categoria_cognitiva: 'Atención / memoria de trabajo', activo: true },
      { nombre: 'Memory', descripcion:  "Encuentra todas las parejas de cartas y pon a prueba tu memoria visual", categoria_cognitiva: 'Memoria visual / espacial', activo: true },
    ];

    for (const juegoData of juegosData) {
      await Juego.findOrCreate({
        where: { nombre: juegoData.nombre },
        defaults: juegoData
      });   
    }

    //Crear un usuario de prueba
    const passwordHash = await bcryptjs.hash('password123', 10);

    const usuariosData = [
      { nombre: 'Rodrigo', apellidos: 'García', email: "rodrigo.garcia@example.com", password_hash: passwordHash, fecha_nacimiento: '1950-01-01', foto_perfil: "https://example.com/foto.jpg", email_cuidador: "cuidador@example.com", nombre_cuidador: "María", activo: true},
      { nombre: 'María', apellidos: 'López', email: "maria.lopez@example.com", password_hash: passwordHash, fecha_nacimiento: '1960-01-01', foto_perfil: "https://example.com/foto2.jpg", email_cuidador: "cuidador2@example.com", nombre_cuidador: "Juan", activo: true },
      { nombre: 'Juan', apellidos: 'Pérez', email: "juan.perez@example.com", password_hash: passwordHash, fecha_nacimiento: '1970-01-01', foto_perfil: "https://example.com/foto3.jpg", email_cuidador: "cuidador3@example.com", nombre_cuidador: "Ana", activo: true}
    ];

    for (const usuarioData of usuariosData) {
      await Usuario.findOrCreate({
        where: { email: usuarioData.email },
        defaults: usuarioData
      });
    }

    console.log("Datos de prueba insertados correctamente.");
    } catch (error) {
    console.error("Error al insertar datos de prueba:", error);
    } finally {
    await sequelize.close();
    }
}

seed();




