require('dotenv').config();

//Importar 
const express = require('express');
const cors = require('cors');
const router = require('./routes/auth'); // Asegúrate de que la ruta sea correcta

//Crear la app con express()
const app = express();

//Añadir cors
app.use(cors());    

//Añadir el middleware express.json()
app.use(express.json());

//Usar el router para las rutas de autenticación
app.use('/auth', router);

//Definir el puerto (puedes sacarlo de process.env.PORT con un valor por defecto)
const PORT = process.env.PORT || 3000;

//Hacer que el servidor escuche en ese puerto con app.listen()
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

//Exportar la app para usarla en otros archivos (como en los tests)
module.exports = app;