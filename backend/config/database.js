// Configura y exporta la conexión a la base de datos MariaDB mediante Sequelize
const { Sequelize } = require('sequelize');

require('dotenv').config();

// Instancia de conexión con credenciales leídas del .env
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

// Verificación de la conexión al arrancar el servidor
sequelize.authenticate()
    .then(() => console.log('✅ Conexión a MariaDB establecida correctamente'))
    .catch(err => console.error('❌ Error al conectar con MariaDB:', err));

// Exportación para usar en models/index.js
module.exports = sequelize;
