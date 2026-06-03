// Punto de entrada del servidor: configura middlewares, monta rutas y arranca Express

// Carga de variables de entorno y registro de tareas programadas al arrancar
require('dotenv').config();
require('./jobs/informesCron');
require('./jobs/inactividadCron');

// Dependencias principales del servidor
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routers de cada entidad de la aplicación
const authRouter = require('./routes/auth');
const usuariosRouter = require('./routes/usuarios');
const partidasRouter = require('./routes/partidas');
const estadisticasRouter = require('./routes/estadisticas');
const refranesRouter = require('./routes/refranes');
const intrusosRouter = require('./routes/intrusos');

// Instancia principal de la aplicación Express
const app = express();

// Middlewares globales: habilitan CORS, lectura de JSON y servicio de PDFs
app.use(cors());
app.use(express.json());
app.use('/informes', express.static(path.join(__dirname, 'public/informes')));

// Registro de rutas agrupadas por entidad
app.use('/auth', authRouter);
app.use('/usuarios', usuariosRouter);
app.use('/partidas', partidasRouter);
app.use('/estadisticas', estadisticasRouter);
app.use('/refranes', refranesRouter);
app.use('/intrusos', intrusosRouter);

// Puerto de escucha y servicio de envío de correos
const PORT = process.env.PORT || 3000;
const { enviarInformes, enviarRecordatorioInactividad } = require('./services/informeService');

// Endpoints manuales para probar los jobs de correo en desarrollo
app.get('/test-informe', async (req, res) => {
    try {
        await enviarInformes();
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.get('/test-inactividad', async (req, res) => {
    try {
        await enviarRecordatorioInactividad();
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Arranque del servidor en el puerto configurado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Exportación para poder usar la app en tests
module.exports = app;