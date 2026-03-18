//Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

//Importar 
const express = require('express');
const cors = require('cors');
const router = require('./routes/auth'); 
const usuariosRouter = require('./routes/usuarios'); 
const partidasRouter = require('./routes/partidas');
const estadisticasRouter = require('./routes/estadisticas');

//Crear la app con express()
const app = express();

//Añadir cors
app.use(cors());    

//Añadir el middleware express.json()
app.use(express.json());

//Usar el router para las rutas de autenticacióncd back
app.use('/auth', router);

//Usar el router para las rutas de usuarios
app.use('/usuarios', usuariosRouter);

//Usar el router para las rutas de partidas
app.use('/partidas', partidasRouter);

//Usar el router para las rutas de estadísticas
app.use('/estadisticas', estadisticasRouter);

//Definir el puerto (puedes sacarlo de process.env.PORT con un valor por defecto)
const PORT = process.env.PORT || 3000;

//Hacer que el servidor escuche en ese puerto con app.listen()
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

//Exportar la app para usarla en otros archivos (como en los tests)
module.exports = app;