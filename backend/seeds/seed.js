// Script de seed: inserta datos iniciales de prueba en la base de datos
// Ejecución: node seeds/seed.js (desde la carpeta backend)

// usar findOrCreate() en lugar de create() garantiza idempotencia,
// es decir, se puede ejecutar el script múltiples veces sin duplicar datos.

// nunca llamar a sequelize.sync() aquí. La BD debe estar ya creada
// y sincronizada previamente. Llamar a sync() dentro del seed causa errores
// de restricciones de claves foráneas en MariaDB.

const { sequelize, Usuario, Juego, Refran, Intruso } = require('../models/index.js'); 
const bcryptjs = require('bcryptjs'); 

async function seed() {
    try {
        // Insertamos los 3 juegos de StimulApp
        const juegosData = [
            {
                nombre: 'Acaba el refrán',
                descripcion: 'Completa refranes populares españoles y ejercita tu memoria semántica',
                categoria_cognitiva: 'Lenguaje / memoria semántica',
                activo: true
            },
            {
                nombre: 'Encuentra el intruso',
                descripcion: 'Identifica el elemento que no pertenece al grupo y entrena tu atención',
                categoria_cognitiva: 'Atención / memoria de trabajo',
                activo: true
            },
            {
                nombre: 'Memory',
                descripcion: 'Encuentra todas las parejas de cartas y pon a prueba tu memoria visual',
                categoria_cognitiva: 'Memoria visual / espacial',
                activo: true
            },
        ];

        for (const juegoData of juegosData) {
            await Juego.findOrCreate({
                where: { nombre: juegoData.nombre },
                defaults: juegoData
            });
        }

        // Hasheamos la contraseña una sola vez y la reutilizamos para los 3 usuarios
        const passwordHash = await bcryptjs.hash('password123', 10);

        const usuariosData = [
            {
                nombre: 'Sergio', apellidos: 'González',
                email: 'sergio.gonzalez@example.com',
                password_hash: passwordHash,
                fecha_nacimiento: '1988-08-29',
                foto_perfil: null,
                email_cuidador: 'cuidador@example.com', nombre_cuidador: 'María',
                activo: true
            },
            {
                nombre: 'María', apellidos: 'Rodríguez',
                email: 'maria.rodriguez@example.com',
                password_hash: passwordHash,
                fecha_nacimiento: '1989-03-14',
                foto_perfil: null,
                email_cuidador: 'cuidador2@example.com', nombre_cuidador: 'Juan',
                activo: true
            },
            {
                nombre: 'Juan', apellidos: 'Pérez',
                email: 'juan.perez@example.com',
                password_hash: passwordHash,
                fecha_nacimiento: '1970-01-01',
                foto_perfil: null,
                email_cuidador: 'cuidador3@example.com', nombre_cuidador: 'Ana',
                activo: true
            }
        ];

        for (const usuarioData of usuariosData) {
            await Usuario.findOrCreate({
                where: { email: usuarioData.email },
                defaults: usuarioData
            });
        }

        const refranesData = [
            {
                primera_parte: 'A caballo regalado,',
                opcion_uno: 'se le mira el precio',
                opcion_dos: 'se le mira la edad',
                opcion_correcta: 'no se le mira el diente'
            },
            {
                primera_parte: 'Más vale tarde,',
                opcion_uno: 'que pronto',
                opcion_dos: 'que siempre',
                opcion_correcta: 'que nunca'
            },
            {
                primera_parte: 'En casa de herrero,',
                opcion_uno: 'cuchillo de oro',
                opcion_dos: 'cuchillo de hierro',
                opcion_correcta: 'cuchillo de palo'
            },
            {
                primera_parte: 'No hay mal que por bien,',
                opcion_uno: 'se vaya',
                opcion_dos: 'venga solo',
                opcion_correcta: 'no venga'
            },
            {
                primera_parte: 'Ojos que no ven,',
                opcion_uno: 'corazón que siente',
                opcion_dos: 'alma que no duerme',
                opcion_correcta: 'corazón que no siente'
            },
            {
                primera_parte: 'Dime con quién andas,',
                opcion_uno: 'y te diré qué comes',
                opcion_dos: 'y te diré adónde vas',
                opcion_correcta: 'y te diré quién eres'
            },
            {
                primera_parte: 'A buen hambre,',
                opcion_uno: 'no hay mal vino',
                opcion_dos: 'no hay buena mesa',
                opcion_correcta: 'no hay mal pan'
            },
            {
                primera_parte: 'El que mucho abarca,',
                opcion_uno: 'mucho aprieta',
                opcion_dos: 'todo lo pierde',
                opcion_correcta: 'poco aprieta'
            },
            {
                primera_parte: 'Agua que no has de beber,',
                opcion_uno: 'guárdala bien',
                opcion_dos: 'no la toques',
                opcion_correcta: 'déjala correr'
            },
            {
                primera_parte: 'Camarón que se duerme,',
                opcion_uno: 'se lo lleva el viento',
                opcion_dos: 'pierde el camino',
                opcion_correcta: 'se lo lleva la corriente'
            }
        ];

        for (const refranData of refranesData) {
            await Refran.findOrCreate({
                where: { primera_parte: refranData.primera_parte },
                defaults: refranData
            });
        }

        const intrusosData = [
            {
                imagen_uno: '/intrusos/facil_p1_perro.png',
                imagen_dos: '/intrusos/facil_p1_pajaro.png',
                imagen_tres: '/intrusos/facil_p1_gato.png',
                imagen_cuatro: '/intrusos/facil_p1_coche.png',
                imagen_intrusa: '/intrusos/facil_p1_coche.png',
                nivel: 'facil',
                explicacion: 'El coche es el intruso porque es un vehículo, mientras que el resto son animales.'
            },
            {
                imagen_uno: '/intrusos/facil_p2_bici.png',
                imagen_dos: '/intrusos/facil_p2_bus.png',
                imagen_tres: '/intrusos/facil_p2_coche.png',
                imagen_cuatro: '/intrusos/facil_p2_perro.png',
                imagen_intrusa: '/intrusos/facil_p2_perro.png',
                nivel: 'facil',
                explicacion: 'El perro es el intruso porque es un animal, mientras que el resto son vehículos.'
            },
            {
                imagen_uno: '/intrusos/facil_p3_camiseta.png',
                imagen_dos: '/intrusos/facil_p3_pantalones.png',
                imagen_tres: '/intrusos/facil_p3_tenis.png',
                imagen_cuatro: '/intrusos/facil_p3_perro.png',
                imagen_intrusa: '/intrusos/facil_p3_perro.png',
                nivel: 'facil',
                explicacion: 'El perro es el intruso porque es un animal, mientras que el resto son prendas de ropa.'
            },
            {
                imagen_uno: '/intrusos/dificil_p1_perro.png',
                imagen_dos: '/intrusos/dificil_p1_gato.png',
                imagen_tres: '/intrusos/dificil_p1_lobo.png',
                imagen_cuatro: '/intrusos/dificil_p1_delfin.png',
                imagen_intrusa: '/intrusos/dificil_p1_delfin.png',
                nivel: 'dificil',
                explicacion: 'El delfín es el intruso porque es el único animal acuático, mientras que el resto son animales terrestres.'
            },
            {
                imagen_uno: '/intrusos/dificil_p2_silla.png',
                imagen_dos: '/intrusos/dificil_p2_mesa.png',
                imagen_tres: '/intrusos/dificil_p2_sofa.png',
                imagen_cuatro: '/intrusos/dificil_p2_nevera.png',
                imagen_intrusa: '/intrusos/dificil_p2_nevera.png',
                nivel: 'dificil',
                explicacion: 'La nevera es el intruso porque es un electrodoméstico, mientras que el resto son muebles.'
            },
            {
                imagen_uno: '/intrusos/dificil_p3_coche.png',
                imagen_dos: '/intrusos/dificil_p3_bici.png',
                imagen_tres: '/intrusos/dificil_p3_moto.png',
                imagen_cuatro: '/intrusos/dificil_p3_barco.png',
                imagen_intrusa: '/intrusos/dificil_p3_barco.png',
                nivel: 'dificil',
                explicacion: 'El barco es el intruso porque es el único medio de transporte acuático, mientras que el resto circulan por tierra.'
            }
        ];

        for (const intrusoData of intrusosData) {
            await Intruso.findOrCreate({
                where: { imagen_intrusa: intrusoData.imagen_intrusa, nivel: intrusoData.nivel },
                defaults: intrusoData
            });
        }

        console.log('✅ Datos de prueba insertados correctamente.');

    } catch (error) {
        console.error('Error al insertar datos de prueba:', error);

    } finally {
        await sequelize.close();
    }
}

seed();