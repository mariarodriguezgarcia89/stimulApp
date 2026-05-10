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

async function enviarCorreoAlCuidador(emailCuidador, nombreUsuario, nombreJuego, puntuacion, media) {

    const bloqueDestacado = `
        <div style="background-color:#FAEAEA; border-left:4px solid #8B2020; border-radius:0 8px 8px 0; padding:20px 24px; margin-bottom:24px;">
            <p style="font-size:13px; text-transform:uppercase; letter-spacing:1.5px; color:#8B2020; margin:0 0 12px 0; font-weight:600;">Detalle del aviso</p>
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding:6px 0; font-size:15px; color:#5C1E2C;"><strong>Usuario:</strong></td>
                    <td style="padding:6px 0; font-size:15px; color:#6B5460;">${nombreUsuario}</td>
                </tr>
                <tr>
                    <td style="padding:6px 0; font-size:15px; color:#5C1E2C;"><strong>Juego:</strong></td>
                    <td style="padding:6px 0; font-size:15px; color:#6B5460;">${nombreJuego}</td>
                </tr>
                <tr>
                    <td style="padding:6px 0; font-size:15px; color:#5C1E2C;"><strong>Puntuación obtenida:</strong></td>
                    <td style="padding:6px 0; font-size:15px; color:#8B2020; font-weight:600;">${puntuacion} puntos</td>
                </tr>
                <tr>
                    <td style="padding:6px 0; font-size:15px; color:#5C1E2C;"><strong>Media habitual:</strong></td>
                    <td style="padding:6px 0; font-size:15px; color:#6B5460;">${Math.round(media)} puntos</td>
                </tr>
            </table>
        </div>`;

    const html = generarHTMLEmail({
        saludo:  `Estimado/a cuidador/a,`,
        icono:   '⚠️',
        titulo:  'Aviso de rendimiento',
        cuerpo:  `<p>${nombreUsuario} ha obtenido una puntuación significativamente inferior a su media habitual en el juego <strong>${nombreJuego}</strong>. Le recomendamos que esté atento/a a su evolución en los próximos días.</p>`,
        bloqueDestacado
    });

    const mailOptions = {
        from:    process.env.EMAIL_USER,
        to:      emailCuidador,
        subject: '⚠️ Aviso de rendimiento — StimulApp',
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response);
    } catch (error) {
        console.error('Error al enviar correo:', error);
    }
}

const fs = require('fs');
const path = require('path');

function generarHTMLEmail({ saludo, icono, titulo, cuerpo, bloqueDestacado = '', boton = '' }) {
    let html = fs.readFileSync(
        path.join(__dirname, '../templates/email.html'),
        'utf8'
    );

    html = html.replace('{{SALUDO}}',           saludo);
    html = html.replace('{{ICONO}}',            icono);
    html = html.replace('{{TITULO}}',           titulo);
    html = html.replace('{{CUERPO}}',           cuerpo);
    html = html.replace('{{BLOQUE_DESTACADO}}', bloqueDestacado);
    html = html.replace('{{BOTON}}',            boton);
    html = html.replaceAll('{{EMAIL_REMITENTE}}',  process.env.EMAIL_USER || 'stimulapp.alertas@gmail.com');

    return html;
}

// Exportamos solo la función, no el transporter.
// El transporter es un detalle de implementación interno de este módulo
module.exports = {
    enviarCorreoAlCuidador,
    transporter,
    generarHTMLEmail
};