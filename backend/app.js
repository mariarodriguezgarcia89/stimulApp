// Cargamos las variables de entorno desde el archivo .env
require('dotenv').config();

require('./jobs/informesCron');
require('./jobs/inactividadCron');

// Express crea el servidor HTTP y define rutas 
// cors permite que el frontend (Puerto 5173 en desarrollo) pueda hacer peticiones al backend
// (puerto 3000) sin que el navegador las bloquee por política de mismo origen.
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importamos cada router desde su archivo de rutas
// Cada router agrupa los endpoints relacionados con una misma entidad
const authRouter = require('./routes/auth');
const usuariosRouter = require('./routes/usuarios');
const partidasRouter = require('./routes/partidas');
const estadisticasRouter = require('./routes/estadisticas');
const refranesRouter = require('./routes/refranes');
const intrusosRouter = require('./routes/intrusos');

// Creamos la aplicación Express. Es el objeto central del servidor
const app = express();

// cors() como middleware global: habilita las peticiones cross-origin en todas las rutas.
// Sin esto, el navegador bloquearía las peticiones del frontend al backend.
app.use(cors());

// express.json() permite que Express lea el body de las peticiones en formato JSON.
// Sin este middleware, req.body sería undefined en los POST y PUT.
app.use(express.json());

// Servimos los archivos estáticos de la carpeta 'public/informes' en la ruta '/informes'.
// Esto permite que los informes PDF generados se puedan descargar desde el frontend
app.use('/informes', express.static(path.join(__dirname, 'public/informes')));

// Montamos cada router en su prefijo correspondiente
// Esto significa que, por ejemplo, una ruta definida como POST '/' dentro de routes/auth.js
// será accesible desde fuera como POST '/auth/'.
app.use('/auth', authRouter);
app.use('/usuarios', usuariosRouter);
app.use('/partidas', partidasRouter);
app.use('/estadisticas', estadisticasRouter);
app.use('/refranes', refranesRouter);
app.use('/intrusos', intrusosRouter);

// Leemos el puerto del .env. Si no está definido, usamos 3000 como valor por defecto
// Así el mismo código funciona en local y en un servidor de producción sin modificarlo
const PORT = process.env.PORT || 3000;

const { enviarInformes, enviarRecordatorioInactividad } = require('./services/informeService');

app.get('/test-informe', async (req, res) => {
    try {
        await enviarInformes();
        res.json({ ok: true, mensaje: 'Informes enviados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.get('/test-inactividad', async (req, res) => {
    try {
        await enviarRecordatorioInactividad();
        res.json({ ok: true, mensaje: 'Recordatorios enviados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Arrancamos el servidor y lo ponemos a escuchar peticiones en el puerto configurado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Exportamos la app
module.exports = app;