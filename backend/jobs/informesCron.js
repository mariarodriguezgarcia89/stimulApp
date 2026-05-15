const nodeCron = require('node-cron');
const { enviarInformes } = require('../services/informeService');

// Programar la tarea para que se ejecute el día 1 de cada mes
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