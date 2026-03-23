const nodemailer = require('nodemailer');

// 1. Configuración del Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',     // El servidor SMTP de Google
    port: 465,                  // Puerto para conexión segura (SSL)
    secure: true,               // true para puerto 465, false para otros
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificación de conexión (opcional pero muy recomendada)
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error en la configuración del correo:', error);
    } else {
        console.log('✅ Servidor de correo listo para enviar mensajes');
    }
});

// 2. Función para enviar correo al cuidador
async function enviarCorreoAlCuidador(emailCuidador, nombreUsuario, nombreJuego, puntuacion, media) {

    const mensaje = `Estimado/a cuidador/a,

                Le informamos de que ${nombreUsuario} ha obtenido una puntuación de ${puntuacion} 
                puntos en el juego "${nombreJuego}", lo que supone un descenso significativo respecto a su media habitual de ${media} puntos.
                Le recomendamos que esté atento/a a su evolución.
                
                    — StimulApp`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailCuidador,
        subject: '⚠️ Alerta de rendimiento - StimulApp',
        text: mensaje
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);
    } catch (error) {
        console.error('Error al enviar correo:', error);
    }
}

module.exports = {
    enviarCorreoAlCuidador
};

