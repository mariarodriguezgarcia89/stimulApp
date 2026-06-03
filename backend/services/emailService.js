// Servicio de correo: configura el transporter SMTP y expone las funciones de envío
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Transporter con conexión SSL a Gmail, reutilizado en cada envío
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificación de la conexión SMTP al arrancar el servidor
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error en la configuración del correo:', error);
    } else {
        console.log('✅ Servidor de correo listo para enviar mensajes');
    }
});

// Envía un correo al cuidador cuando el rendimiento del usuario cae significativamente
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
                    <td style="padding:6px 0; font-size:15px; color:#5C1E2C;"><strong>Media últimas 3 partidas:</strong></td>
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
        cuerpo:  `<p>La media de las <strong>últimas 3 partidas</strong> de ${nombreUsuario} en <strong>${nombreJuego}</strong> ha caído significativamente por debajo de su rendimiento habitual. Le recomendamos que esté atento/a a su evolución en los próximos días.</p>`,
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

// Carga la plantilla HTML del email y sustituye los marcadores por los valores recibidos
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

module.exports = {
    enviarCorreoAlCuidador,
    transporter,
    generarHTMLEmail
};
