// Script de seed: inserta datos iniciales de prueba en la base de datos
// Ejecución: node seeds/seed.js (desde la carpeta backend)

// usar findOrCreate() en lugar de create() garantiza idempotencia,
// es decir, se puede ejecutar el script múltiples veces sin duplicar datos.

// nunca llamar a sequelize.sync() aquí. La BD debe estar ya creada
// y sincronizada previamente. Llamar a sync() dentro del seed causa errores
// de restricciones de claves foráneas en MariaDB.

const { sequelize, Usuario, Juego, Refran } = require('../models/index.js'); 
const bcryptjs = require('bcryptjs'); 

async function seed() {
    try {
        // Insertamos los 3 juegos de StimulApp
        // findOrCreate busca por 'nombre' (campo único). Si no existe, lo crea con 'defaults'.
        // Si ya existe, no hace nada. Así el seed es seguro de ejecutar varias veces.
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
                where: { nombre: juegoData.nombre }, // Criterio de búsqueda: el nombre es único
                defaults: juegoData                  // Valores a usar solo si se crea el registro
            });
        }

        // Hasheamos la contraseña una sola vez y la reutilizamos para los 3 usuarios
        const passwordHash = await bcryptjs.hash('password123', 10);

        const usuariosData = [
            {
                nombre: 'Rodrigo', apellidos: 'García',
                email: 'rodrigo.garcia@example.com',
                password_hash: passwordHash,
                fecha_nacimiento: '1950-01-01',
                foto_perfil: 'https://example.com/foto.jpg',
                email_cuidador: 'cuidador@example.com', nombre_cuidador: 'María',
                activo: true
            },
            {
                nombre: 'María', apellidos: 'López',
                email: 'maria.lopez@example.com',
                password_hash: passwordHash,
                fecha_nacimiento: '1960-01-01',
                foto_perfil: 'https://example.com/foto2.jpg',
                email_cuidador: 'cuidador2@example.com', nombre_cuidador: 'Juan',
                activo: true
            },
            {
                nombre: 'Juan', apellidos: 'Pérez',
                email: 'juan.perez@example.com',
                password_hash: passwordHash,
                fecha_nacimiento: '1970-01-01',
                foto_perfil: 'https://example.com/foto3.jpg',
                email_cuidador: 'cuidador3@example.com', nombre_cuidador: 'Ana',
                activo: true
            }
        ];

        for (const usuarioData of usuariosData) {
            await Usuario.findOrCreate({
                where: { email: usuarioData.email }, // El email es único: sirve como criterio de búsqueda
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
                where: { primera_parte: refranData.primera_parte }, // La primera parte del refrán es única
                defaults: refranData
            });
        }



        console.log('Datos de prueba insertados correctamente.');

    } catch (error) {
        console.error('Error al insertar datos de prueba:', error);

    } finally {
        // Cerramos la conexión a la BD siempre, tanto si el seed fue bien como si falló.
        // Sin esto, el proceso de Node quedaría colgado esperando conexiones abiertas.
        await sequelize.close();
    }
}

// Ejecutamos la función principal
seed();