const nodeCron = require('node-cron');
const { enviarRecordatorioInactividad } = require('../services/informeService');

// Ejecutar cada día a medianoche para comprobar usuarios inactivos
nodeCron.schedule('0 0 * * *', async () => {
    try {
        console.log('Comprobando usuarios inactivos...');
        await enviarRecordatorioInactividad();
    } catch (error) {
        console.error('Error al comprobar inactividad:', error);
    }
}, {
    timezone: 'Europe/Madrid'
});