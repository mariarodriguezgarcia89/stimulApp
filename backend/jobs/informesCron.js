const nodeCron = require('node-cron');
const { enviarInformes } = require('../services/informeService');

// Programar la tarea para que se ejecute cada 15 días
nodeCron.schedule('0 0 1 * *', () => {
    console.log('Ejecutando tarea de envío de informes mensuales...');
    enviarInformes();
}, {
    timezone: 'Europe/Madrid' 
});

