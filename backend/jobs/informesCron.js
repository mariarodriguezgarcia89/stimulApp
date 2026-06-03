// Tarea programada que genera y envía informes de actividad mensual a los usuarios
const nodeCron = require('node-cron');
const { enviarInformes } = require('../services/informeService');

// Ejecución el día 1 de cada mes a medianoche (zona horaria Madrid)
nodeCron.schedule('0 0 1 * *', async () => {
    try {
        console.log('Ejecutando tarea de envío de informes mensuales...');
        await enviarInformes();
    } catch (error) {
        console.error('Error en el envío de informes mensuales:', error);
    }
}, {
    timezone: 'Europe/Madrid'
});
