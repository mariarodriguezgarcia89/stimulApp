const nodemailer = require('nodemailer'); 
// Librería para enviar correos desde Node.js.
// Equivalente a JavaMail en Java.

// TRANSPORTER: gestiona la conexión con el servidor SMTP
// Se configura una sola vez al arrancar el servidor y se reutiliza en cada envío
// Usamos Gmail como servidor saliente con conexión SSL (puerto 465)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Servidor SMTP de Google
    port: 465,               // Puerto SSL de Gmail
    secure: true,            
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// Verificamos al arrancar que la conexión con Gmail es correcta.
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error en la configuración del correo:', error);
    } else {
        console.log('✅ Servidor de correo listo para enviar mensajes');
    }
});

// FUNCIÓN PRINCIPAL
// Envía un correo de alerta al cuidador cuando se detecta un bajón significativo
// en el rendimiento del usuario (puntuación < 70% de su media histórica).
// Parámetros:
//   emailCuidador  — dirección de destino, obtenida del perfil del usuario en la BD
//   nombreUsuario  — nombre del usuario que ha jugado, para personalizar el mensaje
//   nombreJuego    — nombre del juego en el que se ha detectado el bajón
//   puntuacion     — puntuación obtenida en la partida que disparó la alerta
//   media          — media histórica del usuario en ese juego ANTES de esta partida
async function enviarCorreoAlCuidador(emailCuidador, nombreUsuario, nombreJuego, puntuacion, media) {

    // Construimos el cuerpo del mensaje con template literals
    const mensaje = `Estimado/a cuidador/a,

Le informamos de que ${nombreUsuario} ha obtenido una puntuación de ${puntuacion} puntos en el juego "${nombreJuego}", lo que supone un descenso significativo respecto a su media habitual de ${media} puntos.
Le recomendamos que esté atento/a a su evolución.

— StimulApp`;

    // mailOptions define el sobre del correo: quién lo envía, a quién va, asunto y cuerpo.
    const mailOptions = {
        from: process.env.EMAIL_USER,           // Remitente: la cuenta de alertas de StimulApp
        to: emailCuidador,                      // Destinatario: el cuidador registrado en el perfil del usuario
        subject: '⚠️ Alerta de rendimiento - StimulApp',
        text: mensaje
    };

    try {
        // sendMail() realiza el envío de forma asíncrona.
        // Devuelve un objeto info con la respuesta del servidor SMTP.
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);
    } catch (error) {
        // Si el envío falla (dirección inválida, error de red...) lo registramos en consola
        // pero NO lanzamos el error hacia arriba: un fallo en el correo no debe
        // interrumpir el guardado de la partida ni devolver un error al usuario.
        console.error('Error al enviar correo:', error);
    }
}

// Exportamos solo la función, no el transporter.
// El transporter es un detalle de implementación interno de este módulo
module.exports = {
    enviarCorreoAlCuidador,
    transporter
};