// Tarea programada que detecta usuarios inactivos y les envía un recordatorio por correo
const nodeCron = require('node-cron');
const { enviarRecordatorioInactividad } = require('../services/informeService');

// Ejecución diaria a medianoche (zona horaria Madrid)
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
