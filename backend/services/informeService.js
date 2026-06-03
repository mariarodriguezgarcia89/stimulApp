// Servicio de informes: genera PDFs de seguimiento cognitivo y los envía por correo a usuarios y cuidadores
const { Usuario, Partida, Estadistica } = require('../models/index.js');
const { transporter, generarHTMLEmail } = require('./emailService.js');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Plantillas HTML cargadas una sola vez al iniciar el módulo
const TEMPLATE_CUIDADOR = fs.readFileSync(
    path.join(__dirname, '../templates/informe-cuidador.html'),
    'utf8'
);
const TEMPLATE_USUARIO = fs.readFileSync(
    path.join(__dirname, '../templates/informe-usuario.html'),
    'utf8'
);

// Constantes compartidas entre ambos informes
const INFO_JUEGOS = {
    1: { nombre: 'Acaba el Refrán',      area: 'Lenguaje · Memoria semántica',       areaCognitiva: 'Memoria semántica' },
    2: { nombre: 'Encuentra el Intruso',  area: 'Atención · Funciones ejecutivas',    areaCognitiva: 'Atención selectiva' },
    3: { nombre: 'Memory',               area: 'Memoria visual · Atención espacial',  areaCognitiva: 'Memoria visual' }
};

const COLORES_JUEGO = {
    1: '#7B2D3E',
    2: '#3A6B4A',
    3: '#1A4A6B'
};

// Umbrales de rendimiento (% respecto a la media histórica)
const UMBRALES = {
    BIEN: 70,   // ≥ 70% → buen rendimiento
    BAJO: 40    // ≥ 40% y < 70% → puede mejorar / < 40% → requiere atención
};

// Helpers de cálculo compartidos entre ambos informes
function calcularDatosBase(partidas, mediasPorJuego) {
    const partidasPorJuego = {};
    partidas.forEach(p => {
        if (!partidasPorJuego[p.juego_id]) partidasPorJuego[p.juego_id] = [];
        partidasPorJuego[p.juego_id].push(p);
    });

    const juegosConDatos = Object.keys(partidasPorJuego).map(Number);

    const mediaActualPorJuego = {};
    juegosConDatos.forEach(id => {
        const puntuaciones = partidasPorJuego[id].map(p => p.puntuacion);
        mediaActualPorJuego[id] = Math.round(puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length);
    });

    const porcentajesPorJuego = {};
    juegosConDatos.forEach(id => {
        const mHist = Math.round(mediasPorJuego[id] || 0);
        const mAct  = mediaActualPorJuego[id] || 0;
        porcentajesPorJuego[id] = mHist > 0 ? Math.round((mAct / mHist) * 100) : 100;
    });

    return { partidasPorJuego, juegosConDatos, mediaActualPorJuego, porcentajesPorJuego };
}

function obtenerNivel(porcentaje) {
    return porcentaje >= UMBRALES.BIEN ? 'bien' : porcentaje >= UMBRALES.BAJO ? 'bajo' : 'alerta';
}

function obtenerColorHexNivel(porcentaje) {
    return porcentaje >= UMBRALES.BIEN ? '#3A6B4A' : porcentaje >= UMBRALES.BAJO ? '#B8621A' : '#8B2020';
}

function calcularFechas() {
    const hoy    = new Date();
    const hace30 = new Date(); hace30.setDate(hoy.getDate() - 30);
    return {
        fechaHoy: hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        fechaIni: hace30.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        fechaFin: hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    };
}

// Genera el HTML del informe para el cuidador: gráficos, valoraciones clínicas y notas
function generarHTMLCuidador(usuario, partidas, mediasPorJuego, diasUnicos) {

    let html = TEMPLATE_CUIDADOR;

    // Construye el nombre completo evitando duplicar nombre dentro de apellidos
        const nombre = (usuario.nombre || '').trim();
        const apellidos = (usuario.apellidos || '').trim();

        let nombreCompleto;
        if (!apellidos) {
            nombreCompleto = nombre;
        } else if (apellidos.toLowerCase().startsWith(nombre.toLowerCase() + ' ')) {
            nombreCompleto = apellidos;
        } else {
            nombreCompleto = `${nombre} ${apellidos}`;
        }

    const { partidasPorJuego, juegosConDatos, mediaActualPorJuego, porcentajesPorJuego } =
        calcularDatosBase(partidas, mediasPorJuego);

    // Datos para el gráfico de barras
    const datosBarras = {
        labels:    juegosConDatos.map(id => INFO_JUEGOS[id]?.nombre || `Juego ${id}`),
        historico: juegosConDatos.map(id => Math.round(mediasPorJuego[id] || 0)),
        actual:    juegosConDatos.map(id => mediaActualPorJuego[id] || 0)
    };

    const coloresActual = juegosConDatos.map(id => obtenerColorHexNivel(porcentajesPorJuego[id]));

    // Datos para el gráfico de línea temporal
    const coloresLinea = juegosConDatos.map(id => COLORES_JUEGO[id] || '#7B2D3E');
    const todasLasFechas = [...new Set(
        partidas.map(p => new Date(p.fecha).toISOString().split('T')[0])
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
            pointBackgroundColor: coloresLinea[idx],
            pointBorderColor: '#FDFAF5',
            pointBorderWidth: 2,
            spanGaps: true,
            fill: true
        };
    });
    const datosLinea = { fechas: fechasFormateadas, series: seriesLinea };

    const perfilCognitivo = generarPerfilCognitivoHTML(juegosConDatos, porcentajesPorJuego);

    // Tarjetas de juego con valoración clínica para el cuidador
    let tarjetasHTML = '';
    juegosConDatos.forEach(id => {
        const mediaAnterior = Math.round(mediasPorJuego[id] || 0);
        const mediaActual   = mediaActualPorJuego[id];
        const porcentaje    = porcentajesPorJuego[id];
        const nivel         = obtenerNivel(porcentaje);
        const badgeTexto    = nivel === 'bien' ? '✓ Buen rendimiento' : nivel === 'bajo' ? '⚠ Puede mejorar' : '⚠ Requiere atención';
        const variacion     = mediaAnterior > 0 ? Math.round(((mediaActual - mediaAnterior) / mediaAnterior) * 100) : 0;
        const anchoBar      = Math.min(porcentaje, 100);

        const valoracion = obtenerValoracionCuidador(id, nivel, porcentaje, mediaActual, mediaAnterior, nombreCompleto);

        // Nota clínica adicional solo cuando el nivel es alerta
        const notaClinicaHTML = nivel === 'alerta' ? `
            <div class="clinical-note">
                <div class="clinical-note__title">Nota clínica</div>
                <p class="clinical-note__text">Le recomendamos comentar estos resultados con el equipo médico de referencia de ${nombreCompleto} para una valoración más detallada, especialmente si usted ha observado dificultades en su vida diaria: desorientación, olvidos frecuentes de objetos o dificultad para seguir instrucciones visuales.</p>
            </div>` : '';

        tarjetasHTML += `
        <article class="juego-card juego-card--${nivel}">
            <div class="juego-card__header">
                <div>
                    <h3 class="juego-card__title">${INFO_JUEGOS[id]?.nombre || `Juego ${id}`}</h3>
                    <div class="juego-card__area">${INFO_JUEGOS[id]?.area || ''}</div>
                </div>
                <span class="juego-card__badge juego-card__badge--${nivel}">${badgeTexto}</span>
            </div>
            <div class="juego-card__metrics">
                <div class="juego-card__metric">
                    <span class="juego-card__metric-value">${mediaAnterior}</span>
                    <span class="juego-card__metric-label">Media histórica</span>
                </div>
                <div class="juego-card__metric-divider"></div>
                <div class="juego-card__metric">
                    <span class="juego-card__metric-value">${mediaActual}</span>
                    <span class="juego-card__metric-label">Media actual</span>
                </div>
                <div class="juego-card__metric-divider"></div>
                <div class="juego-card__metric">
                    <span class="juego-card__metric-value juego-card__metric-value--${nivel}">${variacion >= 0 ? '+' : ''}${variacion}%</span>
                    <span class="juego-card__metric-label">Variación</span>
                </div>
            </div>
            <div class="juego-card__progress">
                <div class="juego-card__progress-labels">
                    <span>Rendimiento actual</span>
                    <span>${porcentaje}% respecto a histórico</span>
                </div>
                <div class="juego-card__progress-track">
                    <div class="juego-card__progress-fill juego-card__progress-fill--${nivel}" style="width:${anchoBar}%"></div>
                </div>
            </div>
            <div class="juego-card__interpretation-block">
                <h4 class="juego-card__interpretation-title">Valoración clínica</h4>
                <p class="juego-card__interpretation">${valoracion}</p>
            </div>
            ${notaClinicaHTML}
        </article>`;
    });

    // Mensaje final adaptado según la frecuencia de uso del período
    const { fechaHoy, fechaIni, fechaFin } = calcularFechas();

    const mensajeFinal = diasUnicos >= 7
        ? `${nombreCompleto} ha demostrado constancia utilizando StimulApp durante este período. Su participación activa es clave para el seguimiento cognitivo. Le animamos a seguir acompañándola en este proceso — su apoyo como cuidador/a marca la diferencia.`
        : `${nombreCompleto} ha utilizado StimulApp ${diasUnicos} días este período. Recordamos que cuantos más días practique, más completo y fiable será el seguimiento. Le animamos a motivar a ${nombreCompleto} para que use la aplicación con mayor frecuencia.`;

    // Sustitución de placeholders en la plantilla HTML del cuidador
    html = html.replaceAll('{{NOMBRE_USUARIO}}', nombreCompleto);
    html = html.replaceAll('{{INICIAL_USUARIO}}',       usuario.nombre.charAt(0).toUpperCase());
    html = html.replaceAll('{{TOTAL_PARTIDAS}}',        partidas.length);
    html = html.replaceAll('{{DIAS_USO}}',              diasUnicos);
    html = html.replaceAll('{{TOTAL_JUEGOS}}',          juegosConDatos.length);
    html = html.replaceAll('{{FECHA_INICIO}}',          fechaIni);
    html = html.replaceAll('{{FECHA_FIN}}',             fechaFin);
    html = html.replaceAll('{{FECHA_GENERACION}}',      fechaHoy);
    html = html.replaceAll('{{MENSAJE_FINAL}}',         mensajeFinal);
    html = html.replaceAll('{{EMAIL_REMITENTE}}',       process.env.EMAIL_USER || 'stimulapp.alertas@gmail.com');
    html = html.replaceAll('{{TARJETAS_JUEGOS}}',       tarjetasHTML);
    html = html.replaceAll('{{PERFIL_COGNITIVO_HTML}}', perfilCognitivo);
    html = html.replaceAll('{{DATOS_BARRAS_JSON}}',     JSON.stringify(datosBarras));
    html = html.replaceAll('{{DATOS_LINEA_JSON}}',      JSON.stringify(datosLinea));
    html = html.replaceAll('{{COLORES_ACTUAL_JSON}}',   JSON.stringify(coloresActual));

    return html;
}

// Genera el HTML del informe para el usuario: comparativa de puntuaciones, recomendaciones y reflexiones
function generarHTMLInformeUsuario(usuario, partidas, mediasPorJuego, diasUnicos) {

    let html = TEMPLATE_USUARIO;

    // Construye el nombre completo evitando duplicar nombre dentro de apellidos
        const nombre = (usuario.nombre || '').trim();
        const apellidos = (usuario.apellidos || '').trim();

        let nombreCompleto;
        if (!apellidos) {
            nombreCompleto = nombre;
        } else if (apellidos.toLowerCase().startsWith(nombre.toLowerCase() + ' ')) {
            nombreCompleto = apellidos;
        } else {
            nombreCompleto = `${nombre} ${apellidos}`;
        }

    const { juegosConDatos, mediaActualPorJuego, porcentajesPorJuego } =
        calcularDatosBase(partidas, mediasPorJuego);

    // Mensajes motivacionales según el nivel de rendimiento
    const MENSAJES = {
        bien:   '¡Lo estás haciendo genial! 🎉',
        bajo:   'Este mes puedes mejorar un poco. ¡Ánimo! 💪',
        alerta: 'Este mes ha costado un poco más. ¡No te preocupes, lo irás mejorando! 🙌'
    };

    let tarjetasHTML = '';
    juegosConDatos.forEach(id => {
        const mediaAnterior = Math.round(mediasPorJuego[id] || 0);
        const mediaActual   = mediaActualPorJuego[id];
        const porcentaje    = porcentajesPorJuego[id];
        const nivel         = obtenerNivel(porcentaje);
        const variacion     = mediaAnterior > 0 ? Math.round(((mediaActual - mediaAnterior) / mediaAnterior) * 100) : 0;
        const recomendaciones = obtenerRecomendacionesUsuario(id, porcentaje);

        // Preguntas de reflexión solo para nivel alerta
        const reflexionHTML = nivel === 'alerta' ? `
            <div class="reflexion-box">
                <div class="reflexion-box__title">Preguntas de reflexión</div>
                <ul>
                    <li>¿Has notado últimamente más dificultad para recordar dónde dejaste objetos cotidianos?</li>
                    <li>¿Has tenido episodios de olvidos inusuales en conversaciones recientes?</li>
                    <li>Si es así, te animamos a comentárselo a tu cuidador o médico de cabecera.</li>
                </ul>
            </div>` : '';

        tarjetasHTML += `
        <article class="juego-card juego-card--${nivel}">
            <h3 class="juego-card__title">${INFO_JUEGOS[id]?.nombre || `Juego ${id}`}</h3>
            <div class="juego-card__message juego-card__message--${nivel}">${MENSAJES[nivel]}</div>
            <div class="score-compare">
                <div class="score-compare__item">
                    <div class="score-compare__label">Tu media histórica</div>
                    <div class="score-compare__value">${mediaAnterior}</div>
                    <div class="score-compare__unit">puntos</div>
                </div>
                <div class="score-compare__arrow" aria-hidden="true">→</div>
                <div class="score-compare__item score-compare__item--highlight score-compare__item--${nivel}">
                    <div class="score-compare__label">Este mes</div>
                    <div class="score-compare__value">${mediaActual}</div>
                    <div class="score-compare__unit">puntos · <strong>${variacion >= 0 ? '+' : ''}${variacion}%</strong></div>
                </div>
            </div>
            <div class="reco-title">Te recomendamos</div>
            <ul class="reco-list">
                ${recomendaciones.map(r => `<li>${r}</li>`).join('')}
            </ul>
            ${reflexionHTML}
        </article>`;
    });

    // Mensaje final adaptado según la frecuencia de uso del período
    const { fechaHoy, fechaIni, fechaFin } = calcularFechas();

    const mensajeFinal = diasUnicos >= 7
        ? `¡Excelente trabajo, ${usuario.nombre}! Cada día que practicas estás cuidando tu mente. Tu constancia marca la diferencia — ¡sigue adelante con ese ánimo!`
        : `Recuerda que cuantos más días uses StimulApp, mejor te irás sintiendo. ¡Ánimo, ${usuario.nombre}! Tu mente merece ese cuidado diario.`;

    // Sustitución de placeholders en la plantilla HTML del usuario
    html = html.replaceAll('{{NOMBRE_USUARIO}}', nombreCompleto);
    html = html.replaceAll('{{INICIAL_USUARIO}}',  usuario.nombre.charAt(0).toUpperCase());
    html = html.replaceAll('{{TOTAL_PARTIDAS}}',   partidas.length);
    html = html.replaceAll('{{DIAS_USO}}',         diasUnicos);
    html = html.replaceAll('{{TOTAL_JUEGOS}}',     juegosConDatos.length);
    html = html.replaceAll('{{FECHA_INICIO}}',     fechaIni);
    html = html.replaceAll('{{FECHA_FIN}}',        fechaFin);
    html = html.replaceAll('{{FECHA_GENERACION}}', fechaHoy);
    html = html.replaceAll('{{MENSAJE_FINAL}}',    mensajeFinal);
    html = html.replaceAll('{{EMAIL_REMITENTE}}',  process.env.EMAIL_USER || 'stimulapp.alertas@gmail.com');
    html = html.replaceAll('{{TARJETAS_JUEGOS}}',  tarjetasHTML);

    return html;
}

// Genera las barras horizontales del perfil cognitivo para el informe del cuidador
function generarPerfilCognitivoHTML(juegosConDatos, porcentajesPorJuego) {
    // Ordena las áreas de mayor a menor porcentaje y genera las barras HTML
    const areas = juegosConDatos.map(id => ({
        nombre:     INFO_JUEGOS[id]?.areaCognitiva || `Área ${id}`,
        porcentaje: porcentajesPorJuego[id],
        nivel:      obtenerNivel(porcentajesPorJuego[id])
    }));
    areas.sort((a, b) => b.porcentaje - a.porcentaje);

    return areas.map(a => `
          <div class="perfil-bar">
            <div class="perfil-bar__label">${a.nombre}</div>
            <div class="perfil-bar__track"><div class="perfil-bar__fill perfil-bar__fill--${a.nivel}" style="width:${Math.min(a.porcentaje, 100)}%"></div></div>
            <div class="perfil-bar__value">${a.porcentaje}%</div>
          </div>`
    ).join('');
}

// Devuelve el texto de valoración clínica por juego y nivel, dirigido al cuidador
function obtenerValoracionCuidador(juegoId, nivel, porcentaje, mediaActual, mediaAnterior, nombreUsuario) {
    const variacionTexto = mediaAnterior > 0
        ? Math.abs(Math.round(((mediaActual - mediaAnterior) / mediaAnterior) * 100)) + '%'
        : '—';

    const valoraciones = {
        1: { // Acaba el Refrán
            bien:   `Su usuario/a, ${nombreUsuario}, muestra un <strong>rendimiento sólido</strong> en tareas de evocación léxica y memoria semántica. La puntuación actual (${mediaActual} puntos) supera la media histórica en un ${variacionTexto}, lo que indica una buena conservación de las capacidades lingüísticas y de acceso al vocabulario. La tendencia es <strong>positiva y estable</strong>. No se requiere intervención adicional en esta área.`,
            bajo:   `Se observa un <strong>descenso moderado</strong> en las tareas de evocación léxica y memoria semántica de ${nombreUsuario}. La puntuación actual (${mediaActual} puntos) se sitúa un ${variacionTexto} por debajo de su media histórica. Le recomendamos observar si ${nombreUsuario} presenta dificultades para encontrar palabras en conversaciones cotidianas o para completar frases habituales.`,
            alerta: `El rendimiento de ${nombreUsuario} en tareas de lenguaje y memoria semántica ha experimentado un <strong>descenso significativo</strong>, situándose en un ${porcentaje}% respecto a su referencia histórica. Esta disminución puede reflejar dificultades en el acceso al vocabulario y la evocación de palabras. Le pedimos que preste especial atención a posibles señales en el día a día de ${nombreUsuario}.`
        },
        2: { // Encuentra el Intruso
            bien:   `Su usuario/a, ${nombreUsuario}, mantiene un <strong>buen nivel</strong> en tareas de atención selectiva y funciones ejecutivas. La puntuación actual (${mediaActual} puntos) supera la media histórica en un ${variacionTexto}, lo que refleja una adecuada capacidad de discriminación y concentración sostenida. No se requiere intervención adicional en esta área.`,
            bajo:   `Se observa un <strong>descenso apreciable</strong> en las tareas de atención selectiva y funciones ejecutivas de ${nombreUsuario}. La puntuación actual (${mediaActual} puntos) se sitúa un ${variacionTexto} por debajo de su media histórica, lo que sugiere una posible dificultad en la capacidad de discriminación y concentración sostenida. Le recomendamos que observe si ${nombreUsuario} presenta distracciones frecuentes o dificultad para completar tareas cotidianas, y que valore si existen <strong>factores externos</strong> (cambios en medicación, calidad del descanso, estado emocional) que puedan estar influyendo.`,
            alerta: `El rendimiento de ${nombreUsuario} en atención selectiva y funciones ejecutivas ha experimentado un <strong>descenso significativo</strong>, situándose en un ${porcentaje}% respecto a su referencia histórica. Esta disminución sostenida puede indicar dificultades crecientes en la capacidad de concentración y toma de decisiones. Le pedimos que preste especial atención a posibles señales en el día a día de ${nombreUsuario}.`
        },
        3: { // Memory
            bien:   `Su usuario/a, ${nombreUsuario}, muestra un <strong>rendimiento sólido</strong> en memoria visual y atención espacial. La puntuación actual (${mediaActual} puntos) supera la media histórica en un ${variacionTexto}, lo que indica una buena conservación de la retención visual. No se requiere intervención adicional en esta área.`,
            bajo:   `Se observa un <strong>descenso moderado</strong> en las tareas de memoria visual y atención espacial de ${nombreUsuario}. La puntuación actual (${mediaActual} puntos) se sitúa un ${variacionTexto} por debajo de su media histórica. Conviene vigilar la evolución en las próximas semanas y observar si ${nombreUsuario} muestra dificultades para orientarse o para recordar la ubicación de objetos.`,
            alerta: `El rendimiento de ${nombreUsuario} en memoria visual y atención espacial ha experimentado un <strong>descenso significativo</strong>, situándose en un ${porcentaje}% respecto a su referencia histórica. Esta disminución sostenida a lo largo del período puede indicar un deterioro en la retención de información visual a corto plazo. Le pedimos que preste especial atención a posibles señales en el día a día de ${nombreUsuario}.`
        }
    };

    return valoraciones[juegoId]?.[nivel] || `Rendimiento actual de ${nombreUsuario}: ${porcentaje}% respecto a la media histórica.`;
}

// Devuelve recomendaciones personalizadas por juego y nivel de rendimiento para el informe del usuario
function obtenerRecomendacionesUsuario(juegoId, porcentajeRendimiento) {

    const recomendacionesPorJuego = {
        1: { // Acaba el refrán
            bien: ["¡Excelente memoria! Sigue manteniendo un léxico y una agilidad mental fantástica. ¡Continúa así!"],
            bajas: [
                "Elige una palabra nueva del diccionario y úsala 3 veces al día.",
                "Haz una lista de 10 nombres de flores, ciudades o países.",
                "Lee una noticia breve y resúmela en voz alta al terminar."
            ],
            muyBajas: [
                "Canta canciones populares para estimular la evocación de palabras.",
                "Nombra 5 objetos que veas en la habitación ahora mismo.",
                "Completa frases cotidianas simples (ej: 'Bebo agua en un...') en voz alta."
            ]
        },
        2: { // Encuentra el intruso
            bien: ["¡Muy bien! Tu capacidad de concentración y atención selectiva está en plena forma. ¡Sigue adelante!"],
            bajas: [
                "Realiza la lista de la compra clasificando los productos por categorías.",
                "Intenta cepillarte los dientes con la mano no dominante.",
                "Lleva el cálculo mental aproximado de los precios en el supermercado."
            ],
            muyBajas: [
                "Separa un puñado de legumbres mezcladas (lentejas de garbanzos).",
                "Sigue visualmente el segundero de un reloj durante un minuto.",
                "Ordena los cubiertos del cajón prestando atención total a su forma."
            ]
        },
        3: { // Memory
            bien: ["¡Enhorabuena! Tienes una retención visual y una orientación espacial envidiable. ¡Magnífico trabajo!"],
            bajas: [
                "Observa un escaparate 30 segundos y recuerda 5 objetos al girarte.",
                "Cambia la ruta de tu paseo habitual y fíjate en detalles nuevos.",
                "Resuelve un pasatiempo de 'encuentra las 7 diferencias'."
            ],
            muyBajas: [
                "Mira una foto familiar y describe el color de la ropa de todos.",
                "Trata de visualizar mentalmente el plato de comida de ayer.",
                "Juega a esconder un objeto en la sala y recuérdalo tras 2 minutos."
            ]
        }
    };

    let categoria;
    if (porcentajeRendimiento >= UMBRALES.BIEN) categoria = "bien";
    else if (porcentajeRendimiento >= UMBRALES.BAJO) categoria = "bajas";
    else categoria = "muyBajas";

    return recomendacionesPorJuego[juegoId]?.[categoria] || [];
}

// Borra los HTMLs de informes con más de X días de antigüedad del directorio público
function limpiarInformesAntiguos(diasMaximos = 60) {
    const directorio = path.join(__dirname, '../public/informes');
    
    // Si el directorio aún no existe, no hay nada que limpiar
    if (!fs.existsSync(directorio)) return;
    
    const ahora = Date.now();
    const limiteMs = diasMaximos * 24 * 60 * 60 * 1000;
    let borrados = 0;
    
    const ficheros = fs.readdirSync(directorio);
    for (const fichero of ficheros) {
        // Solo procesa HTMLs de informes generados por este servicio
        if (!fichero.endsWith('.html')) continue;
        if (!fichero.startsWith('informe_')) continue;
        
        const ruta = path.join(directorio, fichero);
        try {
            const stats = fs.statSync(ruta);
            const edadMs = ahora - stats.mtimeMs;
            
            if (edadMs > limiteMs) {
                fs.unlinkSync(ruta);
                borrados++;
            }
        } catch (err) {
            console.error(`⚠️  No se pudo procesar ${fichero}:`, err.message);
        }
    }
    
    if (borrados > 0) {
        console.log(`🧹 Limpieza: ${borrados} informe(s) antiguo(s) borrado(s).`);
    }
}

// Genera y envía los informes mensuales en PDF a cada usuario y su cuidador
async function enviarInformes() {
    limpiarInformesAntiguos();

    const usuarios = await Usuario.findAll();
    const browser = await puppeteer.launch();

    try {
        for (const usuario of usuarios) {
            try {
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

                const diasUso    = new Set(partidas.map(p => new Date(p.fecha).toDateString()));
                const diasUnicos = diasUso.size;

                // Genera los HTMLs del informe para el usuario y para el cuidador
                const htmlInforme        = generarHTMLCuidador(usuario, partidas, mediasPorJuego, diasUnicos);
                const htmlInformeUsuario = generarHTMLInformeUsuario(usuario, partidas, mediasPorJuego, diasUnicos);

                // Guarda el HTML del usuario en disco y genera su PDF con Puppeteer
                const nombreFicheroUsuario = `informe_usuario_${Date.now()}.html`;
                const rutaFicheroUsuario   = path.join(__dirname, '../public/informes', nombreFicheroUsuario);
                fs.writeFileSync(rutaFicheroUsuario, htmlInformeUsuario);
                const enlaceUsuario = `http://localhost:3000/informes/${nombreFicheroUsuario}`;

                const pageUsuario = await browser.newPage();
                await pageUsuario.setViewport({ width: 794, height: 1123 });
                await pageUsuario.setContent(htmlInformeUsuario, { waitUntil: 'networkidle0' });
                await pageUsuario.emulateMediaType('screen');
                await pageUsuario.evaluate(() => document.fonts.ready);

                // Mide la altura real del contenido para generar el PDF en página continua
                const alturaUsuario = await pageUsuario.evaluate(() => {
                    const footer = document.querySelector('.report-footer');
                    const rect = footer.getBoundingClientRect();
                    return Math.ceil(rect.bottom + window.scrollY);
                });
                
                const pdfBufferUsuario = await pageUsuario.pdf({
                    printBackground: true,
                    width: '794px',
                    height: `${alturaUsuario}px`,
                    margin: { top: '0', bottom: '0', left: '0', right: '0' },
                    pageRanges: '1'
                });
                await pageUsuario.close();

                // Guarda el HTML del cuidador en disco y genera su PDF con Puppeteer
                const nombreFichero = `informe_cuidador_${Date.now()}.html`;
                const rutaFichero   = path.join(__dirname, '../public/informes', nombreFichero);
                fs.writeFileSync(rutaFichero, htmlInforme);
                const enlace = `http://localhost:3000/informes/${nombreFichero}`;

                const pageCuidador = await browser.newPage();
                await pageCuidador.setViewport({ width: 794, height: 1123 });
                await pageCuidador.setContent(htmlInforme, { waitUntil: 'networkidle0' });
                await pageCuidador.emulateMediaType('screen');
                await pageCuidador.evaluate(() => document.fonts.ready);
                await pageCuidador.waitForFunction('window.chartsReady === true', { timeout: 10000 });
                await new Promise(r => setTimeout(r, 500));

                // Mide la altura real del contenido para generar el PDF en página continua
                const alturaCuidador = await pageCuidador.evaluate(() => {
                    const footer = document.querySelector('.report-footer');
                    const rect = footer.getBoundingClientRect();
                    return Math.ceil(rect.bottom + window.scrollY);
                });
                
                const pdfBuffer = await pageCuidador.pdf({
                    printBackground: true,
                    width: '794px',
                    height: `${alturaCuidador}px`,
                    margin: { top: '0', bottom: '0', left: '0', right: '0' },
                    pageRanges: '1'
                });
                await pageCuidador.close();

                // Envío del correo al usuario con el PDF adjunto
                const htmlCorreoUsuario = generarHTMLEmail({
                    saludo:  `Hola, ${nombreUsuario} 😊`,
                    icono:   '📋',
                    titulo:  'Tu informe mensual está listo',
                    cuerpo:  `<p style="font-size:18px; line-height:1.9;">Te enviamos tu informe de seguimiento del último mes en StimulApp.</p>
                              <p style="font-size:18px; line-height:1.9;">En él encontrarás un resumen de todas las partidas que has jugado, cómo ha evolucionado tu rendimiento en cada juego y recomendaciones personalizadas para seguir mejorando.</p>
                              <p style="font-size:18px; line-height:1.9;">Puedes verlo pulsando el botón o descargarlo en PDF desde el archivo adjunto.</p>
                              <p style="font-size:18px; line-height:1.9;">¡Sigue adelante, ${nombreUsuario}! Cada día que practicas estás cuidando tu mente. 🧠</p>`,
                    boton:   `<div style="text-align:center; margin-top:8px;">
                                <a href="${enlaceUsuario}" style="display:inline-block; background-color:#7B2D3E; color:#ffffff; font-size:15px; font-weight:600; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:0.5px;">
                                    Ver mi informe
                                </a>
                              </div>`
                });

                await transporter.sendMail({
                    from:        process.env.EMAIL_USER,
                    to:          emailUsuario,
                    subject:     'Tu informe mensual de StimulApp 📋',
                    html:        htmlCorreoUsuario,
                    attachments: [{ filename: 'informe_usuario.pdf', content: pdfBufferUsuario }]
                });

                // Envío del correo al cuidador con el PDF adjunto (si tiene email asignado)
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
                        attachments: [{ filename: 'informe_cuidador.pdf', content: pdfBuffer }]
                    });
                }

                console.log(`✅ Informes enviados para ${emailUsuario}`);

            } catch (err) {
                console.error(`❌ Error procesando usuario ${usuario.email} (id: ${usuario.id_usuario}):`, err.message);
            }
        }
    } finally {
        await browser.close();
    }
}

// Envía un correo de recordatorio a los usuarios que llevan más de 7 días sin jugar
async function enviarRecordatorioInactividad() {
    const hoy = new Date();
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

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

module.exports = { enviarInformes, generarHTMLCuidador, generarHTMLInformeUsuario, enviarRecordatorioInactividad };
