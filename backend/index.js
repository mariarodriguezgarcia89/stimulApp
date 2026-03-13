//Importar dependencias
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const models = require('./models') //importa los modelos para que se sincronicen con la base de datos

dotenv.config() //carga las variables del archivo .env
const app = express() //crea la aplicación
app.use(cors()) //activa CORS para que el frontend pueda hablar con el backend
app.use(express.json()) //permite recibir JSON en las peticiones
const PORT = process.env.PORT || 3000 //define el puerto
app.listen(PORT, () => console.log(`La aplicación está escuchando en el puerto ${PORT}`)) //arranca el servidor

const sequelize = require('./config/database');

sequelize.authenticate()
    .then(() => console.log('Conexión a MariaDB OK'))
    .catch(err => console.error('Error de conexión:', err));

