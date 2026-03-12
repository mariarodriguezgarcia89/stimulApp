//Importar dependencias
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config() //carga las variables del archivo .env
const app = express() //crea la aplicación
app.use(cors()) //activa CORS para que el frontend pueda hablar con el backend
app.use(express.json()) //permite recibir JSON en las peticiones
const PORT = process.env.PORT || 3000 //define el puerto
app.listen(PORT, () => console.log(`La aplicación está escuchando en el puerto ${PORT}`)) //arranca el servidor