const nodeCron = require('node-cron');
const { enviarRecordatorioInactividad } = require('../services/informeService');

nodeCron.schedule('0 0 1,11,21 * *', () => {
    console.log('Comprobando usuarios inactivos...');
    enviarRecordatorioInactividad();
}, {
    timezone: 'Europe/Madrid'
});