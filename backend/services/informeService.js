const { Usuario, Partida, Estadistica } = require('../models/index.js');
const { transporter } = require('./emailService.js');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// FUNCIÓN generarHTML
// Sustituye en la plantilla informe.html todos los placeholders
// por los datos reales del usuario y sus partidas.
// ─────────────────────────────────────────────────────────────
function generarHTML(usuario, partidas, mediasPorJuego, diasUnicos) {

    // ── 1. LEER LA PLANTILLA ──
    let html = fs.readFileSync(
        path.join(__dirname, '../templates/informe.html'),
        'utf8'
    );

    // ── 2. AGRUPAR PARTIDAS POR JUEGO ──
    const INFO_JUEGOS = {
        1: { nombre: 'Acaba el Refrán',      area: 'Lenguaje · Memoria semántica' },
        2: { nombre: 'Encuentra el Intruso',  area: 'Atención · Funciones ejecutivas' },
        3: { nombre: 'Memory',               area: 'Memoria visual · Atención espacial' }
    };

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
    const hace15   = new Date(); hace15.setDate(hoy.getDate() - 15);
    const opcFecha = { day: 'numeric', month: 'long', year: 'numeric' };
    const fechaHoy = hoy.toLocaleDateString('es-ES', opcFecha);
    const fechaIni = hace15.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const fechaFin = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    const mensajeFinal = diasUnicos >= 7
        ? `¡Excelente trabajo usando StimulApp de forma constante, ${usuario.nombre}! Cada día que practica está invirtiendo en su bienestar cognitivo. ¡Siga adelante con ese ánimo!`
        : `Recordamos que cuantos más días use StimulApp, más completo y fiable será su informe. ¡Ánimo, ${usuario.nombre}! Su mente merece ese cuidado diario.`;

    // ── 7. SUSTITUIR PLACEHOLDERS ──
    html = html.replace('{{NOMBRE_USUARIO}}',      usuario.nombre);
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
        const hace15dias = new Date();
        hace15dias.setDate(hoy.getDate() - 15);

        const partidas = await Partida.findAll({
            where: { usuario_id: usuario.id_usuario, fecha: { [Op.gte]: hace15dias } }
        });

        if (partidas.length === 0) continue;

        const estadisticas = await Estadistica.findAll({
            where: { usuario_id: usuario.id_usuario }
        });

        const mediasPorJuego = {};
        estadisticas.forEach(est => {
            mediasPorJuego[est.juego_id] = Math.round(est.puntuacion_media);
        });

        const diasUso    = new Set(partidas.map(p => new Date(p.fecha).toDateString()));
        const diasUnicos = diasUso.size;

        const htmlInforme = generarHTML(usuario, partidas, mediasPorJuego, diasUnicos);

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

        const asunto = 'Informe quincenal de StimulApp 📋';

        await transporter.sendMail({
            from:    process.env.EMAIL_USER,
            to:      emailUsuario,
            subject: asunto,
            text:    `Hola ${nombreUsuario},\n\nTe adjuntamos tu informe quincenal de StimulApp.\n\nPuedes verlo online aquí: ${enlace}\n\nTambién te lo adjuntamos en PDF por si prefieres descargarlo.\n\nAtentamente, el equipo de StimulApp`,
            attachments: [{ filename: `informe_${nombreUsuario}.pdf`, content: pdfBuffer }]
        });

        if (emailCuidador) {
            await transporter.sendMail({
                from:    process.env.EMAIL_USER,
                to:      emailCuidador,
                subject: asunto,
                text:    `Hola ${nombreCuidador},\n\nAdjuntamos el informe quincenal de ${nombreUsuario}.\n\nPuedes verlo online aquí: ${enlace}\n\nTambién lo encontrará adjunto en PDF.\n\nAtentamente, el equipo de StimulApp`,
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
    const hace10dias = new Date();
    hace10dias.setDate(hoy.getDate() - 10);

    const usuarios = await Usuario.findAll();
    for (const usuario of usuarios) {
        const partidaReciente = await Partida.findOne({
            where: {
                usuario_id: usuario.id_usuario,
                fecha: { [Op.gte]: hace10dias }
            },
            order: [['fecha', 'DESC']]
        });

        if (!partidaReciente) {
            await transporter.sendMail({
                from:    process.env.EMAIL_USER,
                to:      usuario.email,
                subject: '¡Te echamos de menos! 🧠 - StimulApp',
                text:    `Hola ${usuario.nombre},\n\n¡Te hemos echado de menos estos días! Tu gimnasio mental sigue abierto y tus juegos favoritos te están esperando para pasar un buen rato juntos. ¿Te animas con uno hoy?\n\nAtentamente, el equipo de StimulApp`
            });
            console.log(`📩 Recordatorio de inactividad enviado a ${usuario.email}`);
        }
    }
}

module.exports = { enviarInformes, generarHTML, enviarRecordatorioInactividad };