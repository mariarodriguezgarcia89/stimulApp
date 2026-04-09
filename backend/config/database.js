// Importamos la clase Sequelize (ORM para interactuar con MariaDB desde JS)
// Equivalente a Hibernate en Java).
const { Sequelize } = require('sequelize');

// Cargamos las variables de entorno desde el archivo .env.
// Sin esta línea, process.env.DB_NAME etc. serían undefined.
require('dotenv').config();

// Creamos la instancia de conexión a la base de datos.
// Todos se leen del .env para no hardcodear credenciales en el código.
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,  // Dirección del servidor de BD (normalmente localhost en desarrollo)
        dialect: 'mysql',           // Driver a usar
        logging: false,             // Desactiva los logs SQL en consola. En desarrollo se puede poner
                                    // logging: console.log para ver las queries que genera Sequelize.
    }
);

// Verificamos la conexión al arrancar el servidor
sequelize.authenticate()
    .then(() => console.log('✅ Conexión a MariaDB establecida correctamente'))
    .catch(err => console.error('❌ Error al conectar con MariaDB:', err));

// Exportamos la instancia para usarla en models/index.js,
// donde se definen las asociaciones y se ejecuta la sincronización.
module.exports = sequelize;