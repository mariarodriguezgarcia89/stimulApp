const { Usuario, Partida, Estadistica } = require('../models/index.js');
const { transporter, generarHTMLEmail } = require('./emailService.js');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const DIAS_INACTIVIDAD_ALERTA = 7  // Días sin jugar antes de enviar recordatorio

const INFO_JUEGOS = {
    1: { nombre: 'Acaba el Refrán',      area: 'Lenguaje · Memoria semántica' },
    2: { nombre: 'Encuentra el Intruso',  area: 'Atención · Funciones ejecutivas' },
    3: { nombre: 'Memory',               area: 'Memoria visual · Atención espacial' }
}

const PLANTILLA_INFORME = fs.readFileSync(path.join(__dirname, '../templates/informe.html'), 'utf8')
const PLANTILLA_INFORME_USUARIO = fs.readFileSync(path.join(__dirname, '../templates/informe-usuario.html'), 'utf8')

// ─────────────────────────────────────────────────────────────
// FUNCIÓN generarHTML
// Sustituye en la plantilla informe.html todos los placeholders
// por los datos reales del usuario y sus partidas.
// ─────────────────────────────────────────────────────────────
function generarHTMLCuidador(usuario, partidas, mediasPorJuego, diasUnicos) {

    let html = PLANTILLA_INFORME

    const COLORES_JUEGO = {
        1: '#7B2D3E', // granate - Acaba el refrán
        2: '#3A6B4A', // verde   - Encuentra el intruso
        3: '#1A4A6B'  // azul    - Memory
    };

    const partidasPorJuego = {};
    partidas.forEach(partida => {
        if (!partidasPorJuego[partida.juego_id]) {
            partidasPorJuego[partida.juego_id] = [];
        }
        partidasPorJuego[partida.juego_id].push(partida);
    });

    // ── 3. CALCULAR MEDIAS ACTUALES ──
    const mediaActualPorJuego = {};
    Object.keys(partidasPorJuego).forEach(juegoId => {
        const puntuaciones = partidasPorJuego[juegoId].map(p => p.puntuacion);
        const suma = puntuaciones.reduce((acc, val) => acc + val, 0);
        mediaActualPorJuego[juegoId] = Math.round(suma / puntuaciones.length);
    });

    // ── 4. DATOS PARA LOS GRÁFICOS ──
    const juegosConDatos = Object.keys(partidasPorJuego).map(Number);

    // Gráfico de barras
    const datosBarras = {
        labels:    juegosConDatos.map(id => INFO_JUEGOS[id]?.nombre || `Juego ${id}`),
        historico: juegosConDatos.map(id => Math.round(mediasPorJuego[id] || 0)),
        actual:    juegosConDatos.map(id => mediaActualPorJuego[id] || 0)
    };

    // Gráfico radial (porcentaje de rendimiento)
    const porcentajesPorJuego = {};
    juegosConDatos.forEach(id => {
        const mHist = Math.round(mediasPorJuego[id] || 0);
        const mAct  = mediaActualPorJuego[id] || 0;
        porcentajesPorJuego[id] = mHist > 0 ? Math.round((mAct / mHist) * 100) : 100;
    });

    const datosRadial = {
        labels:      juegosConDatos.map(id => INFO_JUEGOS[id]?.nombre || `Juego ${id}`),
        porcentajes: juegosConDatos.map(id => porcentajesPorJuego[id])
    };

    // Colores por nivel para barras y radial
    const coloresActual = juegosConDatos.map(id => {
        const p = porcentajesPorJuego[id];
        return p >= 70 ? '#3A6B4A' : p >= 40 ? '#B8621A' : '#8B2020';
    });

    // Colores fijos por juego para el gráfico de línea
    const coloresLinea = juegosConDatos.map(id => COLORES_JUEGO[id] || '#7B2D3E');

    // Gráfico de línea: ordenar fechas correctamente
    const todasLasFechas = [...new Set(
        partidas.map(p => {
            const d = new Date(p.fecha);
            return d.toISOString().split('T')[0]; // formato YYYY-MM-DD para ordenar bien
        })
    )].sort();

    const fechasFormateadas = todasLasFechas.map(f =>
        new Date(f).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    );

    const seriesLinea = juegosConDatos.map((id, idx) => {
        const puntosPorFecha = {};
        partidasPorJuego[id].forEach(p => {
            const fecha = new Date(p.fecha).toISOString().split('T')[0];
            if (!puntosPorFecha[fecha]) puntosPorFecha[fecha] = [];
            puntosPorFecha[fecha].push(p.puntuacion);
        });

        return {
            label: INFO_JUEGOS[id]?.nombre || `Juego ${id}`,
            data: todasLasFechas.map(f => {
                const vals = puntosPorFecha[f];
                if (!vals) return null;
                return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
            }),
            borderColor: coloresLinea[idx],
            backgroundColor: coloresLinea[idx] + '15',
            tension: 0.4,
            pointRadius: 4,
            spanGaps: true,
            fill: true
        };
    });

    const datosLinea = { fechas: fechasFormateadas, series: seriesLinea };

    // ── 5. GENERAR TARJETAS DE JUEGO ──
    let tarjetasHTML = '';
    juegosConDatos.forEach(id => {
        const mediaAnterior  = Math.round(mediasPorJuego[id] || 0);
        const mediaActual    = mediaActualPorJuego[id];
        const porcentaje     = porcentajesPorJuego[id];
        const recomendaciones = obtenerRecomendaciones(id, porcentaje);

        const nivel      = porcentaje >= 70 ? 'bien' : porcentaje >= 40 ? 'bajo' : 'alerta';
        const badgeTexto = nivel === 'bien' ? '✓ Buen rendimiento' : nivel === 'bajo' ? '⚠ Puede mejorar' : '⚠ Requiere atención';
        const variacion  = mediaAnterior > 0 ? Math.round(((mediaActual - mediaAnterior) / mediaAnterior) * 100) : 0;
        const colorVar   = nivel === 'bien' ? 'var(--verde)' : nivel === 'bajo' ? 'var(--naranja)' : 'var(--rojo)';
        const anchoBar   = Math.min(porcentaje, 100);

        const reflexionHTML = nivel === 'alerta' ? `
        <div class="reflexion-box">
            <div class="reflexion-titulo">Preguntas de reflexión</div>
            <ul>
                <li>¿Ha notado últimamente más dificultad para recordar dónde dejó objetos cotidianos?</li>
                <li>¿Ha tenido episodios de olvidos inusuales en conversaciones recientes?</li>
                <li>Si es así, le animamos a comentárselo a su cuidador o médico de cabecera.</li>
            </ul>
        </div>` : '';

        tarjetasHTML += `
        <div class="juego-card ${nivel}">
            <div class="juego-header">
                <div>
                    <div class="juego-nombre">${INFO_JUEGOS[id]?.nombre || `Juego ${id}`}</div>
                    <div class="juego-area">${INFO_JUEGOS[id]?.area || ''}</div>
                </div>
                <div class="badge ${nivel}">${badgeTexto}</div>
            </div>
            <div class="medias-row">
                <div class="media-item">
                    <div class="val">${mediaAnterior}</div>
                    <div class="lbl">Media histórica</div>
                </div>
                <div class="divider-v"></div>
                <div class="media-item">
                    <div class="val">${mediaActual}</div>
                    <div class="lbl">Media estos 15 días</div>
                </div>
                <div class="divider-v"></div>
                <div class="media-item">
                    <div class="val" style="color:${colorVar}">${variacion >= 0 ? '+' : ''}${variacion}%</div>
                    <div class="lbl">Variación</div>
                </div>
            </div>
            <div class="progreso-area">
                <div class="progreso-labels">
                    <span>Rendimiento actual</span>
                    <span>${porcentaje}% respecto a histórico</span>
                </div>
                <div class="progreso-track">
                    <div class="progreso-fill ${nivel}" style="width:${anchoBar}%"></div>
                </div>
            </div>
            <div class="recomendaciones-titulo">Recomendaciones</div>
            <ul class="recomendaciones-lista">
                ${recomendaciones.map(r => `<li>${r}</li>`).join('')}
            </ul>
            ${reflexionHTML}
        </div>`;
    });

    // ── 6. FECHAS Y MENSAJE FINAL ──
    const hoy      = new Date();
    const hace30   = new Date(); hace30.setDate(hoy.getDate() - 30);
    const opcFecha = { day: 'numeric', month: 'long', year: 'numeric' };
    const fechaHoy = hoy.toLocaleDateString('es-ES', opcFecha);
    const fechaIni = hace30.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const fechaFin = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    const mensajeFinal = diasUnicos >= 7
        ? `¡Excelente trabajo usando StimulApp de forma constante, ${usuario.nombre}! Cada día que practica está invirtiendo en su bienestar cognitivo. ¡Siga adelante con ese ánimo!`
        : `Recordamos que cuantos más días use StimulApp, más completo y fiable será su informe. ¡Ánimo, ${usuario.nombre}! Su mente merece ese cuidado diario.`;

    // ── 7. SUSTITUIR PLACEHOLDERS ──
    html = html.replaceAll('{{NOMBRE_USUARIO}}', usuario.nombre);
    html = html.replace('{{INICIAL_USUARIO}}',     usuario.nombre.charAt(0).toUpperCase());
    html = html.replace('{{TOTAL_PARTIDAS}}',      partidas.length);
    html = html.replace('{{DIAS_USO}}',            diasUnicos);
    html = html.replace('{{TOTAL_JUEGOS}}',        juegosConDatos.length);
    html = html.replace('{{FECHA_INICIO}}',        fechaIni);
    html = html.replace('{{FECHA_FIN}}',           fechaFin);
    html = html.replace('{{FECHA_GENERACION}}',    fechaHoy);
    html = html.replace('{{MENSAJE_FINAL}}',       mensajeFinal);
    html = html.replace('{{EMAIL_REMITENTE}}',     process.env.EMAIL_USER || 'stimulapp.alertas@gmail.com');
    html = html.replace('{{TARJETAS_JUEGOS}}',     tarjetasHTML);
    html = html.replace('{{DATOS_BARRAS_JSON}}',   JSON.stringify(datosBarras));
    html = html.replace('{{DATOS_RADIAL_JSON}}',   JSON.stringify(datosRadial));
    html = html.replace('{{DATOS_LINEA_JSON}}',    JSON.stringify(datosLinea));
    html = html.replace('{{COLORES_ACTUAL_JSON}}', JSON.stringify(coloresActual));

    return html;
}

function generarHTMLUsuario(usuario, partidas, mediasPorJuego, diasUnicos) {

    let html = PLANTILLA_INFORME_USUARIO

    const partidasPorJuego = {};
    partidas.forEach(partida => {
        if (!partidasPorJuego[partida.juego_id]) {
            partidasPorJuego[partida.juego_id] = [];
        }
        partidasPorJuego[partida.juego_id].push(partida);
    });

    const mediaActualPorJuego = {};
    Object.keys(partidasPorJuego).forEach(juegoId => {
        const puntuaciones = partidasPorJuego[juegoId].map(p => p.puntuacion);
        mediaActualPorJuego[juegoId] = Math.round(puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length);
    });

    const juegosConDatos = Object.keys(partidasPorJuego).map(Number);

    const MENSAJES = {
        bien:   '¡Lo está haciendo muy bien! 🎉',
        bajo:   'Este mes puede mejorar un poco. ¡Ánimo!',
        alerta: 'Este mes ha costado un poco más. No se preocupe, ¡lo irá mejorando!'
    };

    let tarjetasHTML = '';
    juegosConDatos.forEach(id => {
        const mediaAnterior  = Math.round(mediasPorJuego[id] || 0);
        const mediaActual    = mediaActualPorJuego[id];
        const porcentaje     = mediaAnterior > 0 ? Math.round((mediaActual / mediaAnterior) * 100) : 100;
        const recomendaciones = obtenerRecomendaciones(id, porcentaje);
        const nivel          = porcentaje >= 70 ? 'bien' : porcentaje >= 40 ? 'bajo' : 'alerta';

        tarjetasHTML += `
        <div class="juego-card ${nivel}">
            <div class="juego-nombre">${INFO_JUEGOS[id]?.nombre || `Juego ${id}`}</div>
            <div class="juego-mensaje ${nivel}">${MENSAJES[nivel]}</div>
            <div class="recomendaciones-titulo">Le recomendamos</div>
            <ul class="recomendaciones-lista">
                ${recomendaciones.map(r => `<li>${r}</li>`).join('')}
            </ul>
        </div>`;
    });

    const hoy    = new Date();
    const hace30 = new Date(); hace30.setDate(hoy.getDate() - 30);
    const fechaHoy = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const fechaIni = hace30.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const fechaFin = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    const mensajeFinal = diasUnicos >= 7
        ? `¡Excelente trabajo, ${usuario.nombre}! Cada día que practica está cuidando su mente. ¡Siga adelante con ese ánimo!`
        : `Recuerde que cuantos más días use StimulApp, mejor se irá sintiendo. ¡Ánimo, ${usuario.nombre}!`;

    html = html.replaceAll('{{NOMBRE_USUARIO}}',   usuario.nombre);
    html = html.replace('{{INICIAL_USUARIO}}',  usuario.nombre.charAt(0).toUpperCase());
    html = html.replace('{{TOTAL_PARTIDAS}}',   partidas.length);
    html = html.replace('{{DIAS_USO}}',         diasUnicos);
    html = html.replace('{{TOTAL_JUEGOS}}',     juegosConDatos.length);
    html = html.replace('{{FECHA_INICIO}}',     fechaIni);
    html = html.replace('{{FECHA_FIN}}',        fechaFin);
    html = html.replace('{{FECHA_GENERACION}}', fechaHoy);
    html = html.replace('{{MENSAJE_FINAL}}',    mensajeFinal);
    html = html.replace('{{EMAIL_REMITENTE}}',  process.env.EMAIL_USER || 'stimulapp.alertas@gmail.com');
    html = html.replace('{{TARJETAS_JUEGOS}}',  tarjetasHTML);

    return html;
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN obtenerRecomendaciones
// Devuelve las recomendaciones según el juego y el porcentaje
// de rendimiento respecto a la media histórica.
// ─────────────────────────────────────────────────────────────
function obtenerRecomendaciones(juegoId, porcentajeRendimiento) {

    const recomendacionesPorJuego = {
        1: { // Acaba el refrán - Lenguaje / Memoria semántica
            bien: ["¡Excelente memoria! Sigue manteniendo un léxico y una agilidad mental fantástica. ¡Continúa así!"],
            bajas: [
                "Elegir una palabra nueva del diccionario y usarla 3 veces al día.",
                "Hacer una lista de 10 nombres de flores, ciudades o países.",
                "Leer una noticia breve y resumirla en voz alta al terminar."
            ],
            muyBajas: [
                "Cantar canciones populares para estimular la evocación de palabras.",
                "Nombrar 5 objetos que vea en la habitación ahora mismo.",
                "Completar frases cotidianas simples (ej: 'Bebo agua en un...') en voz alta."
            ]
        },
        2: { // Encuentra el intruso - Atención / Funciones ejecutivas
            bien: ["¡Muy bien! Su capacidad de concentración y atención selectiva está en plena forma. ¡Siga adelante!"],
            bajas: [
                "Realizar la lista de la compra clasificando los productos por categorías.",
                "Intentar cepillarse los dientes con la mano no dominante.",
                "Llevar el cálculo mental aproximado de los precios en el supermercado."
            ],
            muyBajas: [
                "Separar un puñado de legumbres mezcladas (lentejas de garbanzos).",
                "Seguir visualmente el segundero de un reloj durante un minuto.",
                "Ordenar los cubiertos del cajón prestando atención total a su forma."
            ]
        },
        3: { // Memory - Memoria visual / Atención espacial
            bien: ["¡Enhorabuena! Tiene una retención visual y una orientación espacial envidiable. ¡Magnífico trabajo!"],
            bajas: [
                "Observar un escaparate 30 segundos y recordar 5 objetos al girarse.",
                "Cambiar la ruta de su paseo habitual y fijarse en detalles nuevos.",
                "Resolver un pasatiempo de 'encuentra las 7 diferencias'."
            ],
            muyBajas: [
                "Mirar una foto familiar y describir el color de la ropa de todos.",
                "Tratar de visualizar mentalmente el plato de comida de ayer.",
                "Jugar a esconder un objeto en la sala y recordarlo tras 2 minutos."
            ]
        }
    };

    let categoria;
    if (porcentajeRendimiento >= 70) {
        categoria = "bien";
    } else if (porcentajeRendimiento >= 40) {
        categoria = "bajas";
    } else {
        categoria = "muyBajas";
    }

    return recomendacionesPorJuego[juegoId] ? recomendacionesPorJuego[juegoId][categoria] : [];
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN enviarInformes
// Se ejecuta cada 15 días via cron.
// Genera y envía el informe PDF a cada usuario con partidas.
// ─────────────────────────────────────────────────────────────
async function enviarInformes() {
    
    const usuarios = await Usuario.findAll();
    for (const usuario of usuarios) {
        const nombreUsuario  = usuario.nombre;
        const emailUsuario   = usuario.email;
        const nombreCuidador = usuario.nombre_cuidador || 'Cuidador no asignado';
        const emailCuidador  = usuario.email_cuidador;

        const hoy = new Date();
        const hace30dias = new Date();
        hace30dias.setDate(hoy.getDate() - 30);

        const partidas = await Partida.findAll({
            where: { usuario_id: usuario.id_usuario, fecha: { [Op.gte]: hace30dias } }
        });

        if (partidas.length === 0) continue;

        const estadisticas = await Estadistica.findAll({
            where: { usuario_id: usuario.id_usuario }
        });

        const mediasPorJuego = {};
        estadisticas.forEach(est => {
            mediasPorJuego[est.juego_id] = Math.round(est.puntuacion_media);
        });

        const diasUso = new Set(partidas.map(p => new Date(p.fecha).toISOString().slice(0, 10)));
        const diasUnicos = diasUso.size;

        const htmlInforme = generarHTMLCuidador(usuario, partidas, mediasPorJuego, diasUnicos);
        const htmlInformeUsuario = generarHTMLUsuario(usuario, partidas, mediasPorJuego, diasUnicos);

        // Guardar HTML del usuario en disco
        const nombreFicheroUsuario = `informe-usuario_${usuario.nombre}_${Date.now()}.html`;
        const rutaFicheroUsuario = path.join(__dirname, '../public/informes', nombreFicheroUsuario);
        fs.writeFileSync(rutaFicheroUsuario, htmlInformeUsuario);
        const enlaceUsuario = `http://localhost:3000/informes/${nombreFicheroUsuario}`;

        // Generar PDF del usuario
        const browserUsuario = await puppeteer.launch();
        const pageUsuario = await browserUsuario.newPage();
        await pageUsuario.setContent(htmlInformeUsuario, { waitUntil: 'networkidle0' });
        const pdfBufferUsuario = await pageUsuario.pdf({ format: 'A4', printBackground: true });
        await browserUsuario.close();

        const browser   = await puppeteer.launch();
        const page      = await browser.newPage();
        await page.setContent(htmlInforme, { waitUntil: 'networkidle0' });

        // Guardar el HTML en disco
        const nombreFichero = `informe_${usuario.nombre}_${Date.now()}.html`;
        const rutaFichero = path.join(__dirname, '../public/informes', nombreFichero);
        fs.writeFileSync(rutaFichero, htmlInforme);

        // Construir el enlace
        const enlace = `http://localhost:3000/informes/${nombreFichero}`;

        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        const htmlCorreoUsuario = generarHTMLEmail({
    saludo:  `Hola, ${nombreUsuario} 😊`,
    icono:   '📋',
    titulo:  'Su informe mensual está listo',
    cuerpo:  `<p style="font-size:18px; line-height:1.9;">Le enviamos su informe de seguimiento del último mes en StimulApp.</p>
              <p style="font-size:18px; line-height:1.9;">En él encontrará un resumen de todas las partidas que ha jugado, cómo ha evolucionado su rendimiento en cada juego y recomendaciones personalizadas para seguir mejorando.</p>
              <p style="font-size:18px; line-height:1.9;">Puede verlo pulsando el botón o descargarlo en PDF desde el archivo adjunto.</p>
              <p style="font-size:18px; line-height:1.9;">¡Siga adelante, ${nombreUsuario}! Cada día que practica está cuidando su mente. 🧠</p>`,
    boton: `<div style="text-align:center; margin-top:8px;">
          <a href="${enlaceUsuario}" style="display:inline-block; background-color:#7B2D3E; color:#ffffff; font-size:15px; font-weight:600; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:0.5px;">
              Ver mi informe
          </a>
        </div>`
});

        await transporter.sendMail({
            from:        process.env.EMAIL_USER,
            to:          emailUsuario,
            subject: 'Su informe mensual de StimulApp 📋',
            html:        htmlCorreoUsuario,
            attachments: [{ filename: `informe_${nombreUsuario}.pdf`, content: pdfBufferUsuario }]
        });

        if (emailCuidador) {
    const htmlCorreoCuidador = generarHTMLEmail({
        saludo:  `Estimado/a ${nombreCuidador},`,
        icono:   '📋',
        titulo:  `Informe mensual de ${nombreUsuario}`,
        cuerpo:  `<p>Le adjuntamos el informe de seguimiento cognitivo correspondiente al último mes de actividad de <strong>${nombreUsuario}</strong> en StimulApp. Puede consultarlo en PDF adjunto o verlo online pulsando el botón.</p>`,
        boton:   `<div style="text-align:center; margin-top:8px;">
                    <a href="${enlace}" style="display:inline-block; background-color:#7B2D3E; color:#ffffff; font-size:15px; font-weight:600; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:0.5px;">
                        Ver informe online
                    </a>
                  </div>`
    });

    await transporter.sendMail({
        from:        process.env.EMAIL_USER,
        to:          emailCuidador,
        subject:     `Informe mensual de ${nombreUsuario} — StimulApp 📋`,
        html:        htmlCorreoCuidador,
        attachments: [{ filename: `informe_${nombreUsuario}.pdf`, content: pdfBuffer }]
    });
}

        console.log(`✅ Informe enviado a ${emailUsuario}`);
    }
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN enviarRecordatorioInactividad
// Se ejecuta cada 10 días via cron.
// Envía un recordatorio a usuarios sin partidas en 10 días.
// ─────────────────────────────────────────────────────────────
async function enviarRecordatorioInactividad() {
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - DIAS_INACTIVIDAD_ALERTA)

    const usuarios = await Usuario.findAll();
    for (const usuario of usuarios) {
        const partidaReciente = await Partida.findOne({
            where: {
                usuario_id: usuario.id_usuario,
                fecha: { [Op.gte]: hace7dias }
            },
            order: [['fecha', 'DESC']]
        });

        if (!partidaReciente) {
            const htmlInactividad = generarHTMLEmail({
    saludo:  `Hola, ${usuario.nombre}`,
    icono:   '🧠',
    titulo:  '¡Te echamos de menos!',
    cuerpo:  `<p>Llevamos unos días sin verte por aquí. Tu gimnasio mental sigue abierto y tus juegos favoritos te están esperando.</p>
              <p>Recuerda que unos pocos minutos al día marcan la diferencia. ¿Te animas con una partida hoy?</p>`,
    boton:   `<div style="text-align:center; margin-top:8px;">
                <a href="http://localhost:5173" style="display:inline-block; background-color:#7B2D3E; color:#ffffff; font-size:15px; font-weight:600; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:0.5px;">
                    Volver a jugar
                </a>
              </div>`
});

await transporter.sendMail({
    from:    process.env.EMAIL_USER,
    to:      usuario.email,
    subject: '¡Te echamos de menos! 🧠 — StimulApp',
    html:    htmlInactividad
});
        }
    }
}

module.exports = { enviarInformes, generarHTMLCuidador, generarHTMLUsuario, enviarRecordatorioInactividad };