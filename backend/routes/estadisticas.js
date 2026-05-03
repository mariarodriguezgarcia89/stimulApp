const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sequelize, Estadistica, Partida, Juego } = require('../models');
const { Op } = require('sequelize');

// ─────────────────────────────────────────────────────────────
// Funciones auxiliares (helpers internos del módulo)
// ─────────────────────────────────────────────────────────────

/**
 * Calcula la tendencia de rendimiento de un usuario en un juego concreto.
 * Compara la media de las últimas 5 partidas con la media de todas las anteriores.
 *
 * @param {number} usuarioId - ID del usuario
 * @param {number} juegoId - ID del juego
 * @returns {Object} { tendencia, mensaje, total_partidas }
 */
async function calcularTendencia(usuarioId, juegoId) {
    const filtroBase = { usuario_id: usuarioId, juego_id: juegoId };

    const ultimasPartidas = await Partida.findAll({
        where: filtroBase,
        order: [['fecha', 'DESC']],
        limit: 5,
        attributes: ['id_partida', 'puntuacion', 'fecha']
    });

    if (ultimasPartidas.length === 0) {
        return { tendencia: null, mensaje: 'sin_datos', total_partidas: 0 };
    }

    if (ultimasPartidas.length < 5) {
        return { tendencia: null, mensaje: 'pocas_partidas', total_partidas: ultimasPartidas.length };
    }

    const sumaUltimas = ultimasPartidas.reduce((acc, p) => acc + p.puntuacion, 0);
    const mediaReciente = sumaUltimas / ultimasPartidas.length;
    const fechaFrontera = ultimasPartidas[ultimasPartidas.length - 1].fecha;

    const resultadoHistorico = await Partida.findOne({
        where: { ...filtroBase, fecha: { [Op.lt]: fechaFrontera } },
        attributes: [[sequelize.fn('AVG', sequelize.col('puntuacion')), 'media_historica']],
        raw: true
    });

    if (!resultadoHistorico || resultadoHistorico.media_historica === null) {
        return { tendencia: null, mensaje: 'pocas_partidas', total_partidas: ultimasPartidas.length };
    }

    const mediaHistorica = parseFloat(resultadoHistorico.media_historica);
    const porcentajeCambio = ((mediaReciente - mediaHistorica) / mediaHistorica) * 100;

    return {
        tendencia: {
            media_reciente: parseFloat(mediaReciente.toFixed(2)),
            media_historica: parseFloat(mediaHistorica.toFixed(2)),
            porcentaje_cambio: parseFloat(porcentajeCambio.toFixed(2)),
            partidas_recientes: ultimasPartidas.length
        },
        mensaje: 'ok'
    };
}

/**
 * Detecta si el usuario ha igualado o superado su mejor puntuación
 * en las últimas 5 partidas, en alguno de sus juegos.
 * Devuelve el logro más impresionante (superada > igualada, más reciente),
 * o null si no hay marca reciente.
 *
 * @param {number} usuarioId
 * @param {number[]} idsJuegos
 * @returns {Object|null} { juego_id, fue_superada, mejor_reciente, mejor_anterior, fecha }
 */
async function detectarMarcaPersonalReciente(usuarioId, idsJuegos) {
    const candidatos = [];

    for (const juegoId of idsJuegos) {
        // Las últimas 5 partidas
        const ultimas = await Partida.findAll({
            where: { usuario_id: usuarioId, juego_id: juegoId },
            order: [['fecha', 'DESC']],
            limit: 5,
            attributes: ['puntuacion', 'fecha']
        });

        if (ultimas.length === 0) continue;

        // Mejor puntuación de las últimas 5 + su fecha
        const mejorReciente = ultimas.reduce((max, p) =>
            p.puntuacion > max.puntuacion ? p : max
        );

        // Frontera: la fecha más antigua de esas 5
        const fechaFrontera = ultimas[ultimas.length - 1].fecha;

        // Mejor histórica anterior a esa frontera
        const historico = await Partida.findOne({
            where: {
                usuario_id: usuarioId,
                juego_id: juegoId,
                fecha: { [Op.lt]: fechaFrontera }
            },
            attributes: [[sequelize.fn('MAX', sequelize.col('puntuacion')), 'mejor_anterior']],
            raw: true
        });

        // Si no hay histórico previo, no hay con qué comparar
        if (!historico || historico.mejor_anterior === null) continue;

        const mejorAnterior = historico.mejor_anterior;

        if (mejorReciente.puntuacion > mejorAnterior) {
            candidatos.push({
                juego_id: juegoId,
                fue_superada: true,
                mejor_reciente: mejorReciente.puntuacion,
                mejor_anterior: mejorAnterior,
                fecha: mejorReciente.fecha
            });
        } else if (mejorReciente.puntuacion === mejorAnterior) {
            candidatos.push({
                juego_id: juegoId,
                fue_superada: false,
                mejor_reciente: mejorReciente.puntuacion,
                mejor_anterior: mejorAnterior,
                fecha: mejorReciente.fecha
            });
        }
    }

    if (candidatos.length === 0) return null;

    // Priorizar: 1º superada sobre igualada, 2º más reciente
    candidatos.sort((a, b) => {
        if (a.fue_superada !== b.fue_superada) return b.fue_superada - a.fue_superada;
        return new Date(b.fecha) - new Date(a.fecha);
    });

    return candidatos[0];
}


/**
 * Calcula la racha actual y el récord de días consecutivos jugando
 * a CUALQUIER juego del sistema.
 *
 * @param {number} usuarioId
 * @returns {Object} { actual, record, ultima_partida }
 */
async function calcularRachaDias(usuarioId) {
    const partidas = await Partida.findAll({
        where: { usuario_id: usuarioId },
        attributes: ['fecha'],
        order: [['fecha', 'DESC']],
        raw: true
    });

    if (partidas.length === 0) {
        return { actual: 0, record: 0, ultima_partida: null };
    }

    // Convertir a strings YYYY-MM-DD únicos (sin hora)
    const diasUnicos = [...new Set(
        partidas.map(p => new Date(p.fecha).toISOString().slice(0, 10))
    )].sort().reverse();
    // diasUnicos = ['2026-05-02', '2026-05-01', '2026-04-29', ...] (descendente)

    // ── Racha actual: días consecutivos hasta hoy o ayer ──
    const hoy = new Date().toISOString().slice(0, 10);
    const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let rachaActual = 0;
    let fechaEsperada = diasUnicos[0] === hoy ? hoy : (diasUnicos[0] === ayer ? ayer : null);

    if (fechaEsperada) {
        for (const dia of diasUnicos) {
            if (dia === fechaEsperada) {
                rachaActual++;
                // Calcular el día anterior
                const d = new Date(fechaEsperada);
                d.setDate(d.getDate() - 1);
                fechaEsperada = d.toISOString().slice(0, 10);
            } else {
                break;
            }
        }
    }

    // ── Récord histórico: la racha más larga jamás registrada ──
    let recordRacha = 0;
    let rachaTemp = 1;
    const diasOrdenadosAsc = [...diasUnicos].reverse(); // ahora ascendente

    for (let i = 1; i < diasOrdenadosAsc.length; i++) {
        const anterior = new Date(diasOrdenadosAsc[i - 1]);
        const actual = new Date(diasOrdenadosAsc[i]);
        const diffDias = (actual - anterior) / 86400000;

        if (diffDias === 1) {
            rachaTemp++;
        } else {
            recordRacha = Math.max(recordRacha, rachaTemp);
            rachaTemp = 1;
        }
    }
    recordRacha = Math.max(recordRacha, rachaTemp);

    return {
        actual: rachaActual,
        record: Math.max(recordRacha, rachaActual),
        ultima_partida: diasUnicos[0]
    };
}

router.get('/resumen', auth, async (req, res) => {
    try {
        const resumen = await Partida.findAll({
            // Filtro: solo las partidas del usuario logueado
            where: { usuario_id: req.user.id },

            // attributes le dice a Sequelize qué columnas devolver.
            // Aquí mezclamos columnas normales y funciones agregadas.
            attributes: [
                // Columna normal: necesitamos saber a qué juego corresponde cada fila del resultado
                'juego_id',

                // Cada [funcion, 'alias'] equivale a "FUNCION(columna) AS alias" en SQL
                [sequelize.fn('COUNT', sequelize.col('id_partida')), 'total_partidas'],
                [sequelize.fn('AVG',   sequelize.col('puntuacion')), 'puntuacion_media'],
                [sequelize.fn('MAX',   sequelize.col('puntuacion')), 'mejor_puntuacion'],
                [sequelize.fn('MAX',   sequelize.col('fecha')),      'ultima_partida']
            ],

            // JOIN con la tabla juegos para traernos el nombre del juego
            include: [{ model: Juego, attributes: ['nombre'] }],

            // GROUP BY: como usamos funciones agregadas (COUNT, AVG, MAX),
            // tenemos que agrupar por las columnas no agregadas.
            // Importante: incluir también la PK del modelo del JOIN (Juego.id_juego),
            // si no, MariaDB se queja.
            group: ['partidas.juego_id', 'juego.id_juego']
        });

        res.json(resumen);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las estadísticas del usuario.' });
    }
});

// Obtener evolución de estadísticas
router.get('/evolucion', auth, async (req, res) => {
    try {
        const where = { usuario_id: req.user.id };
               if (req.query.juego_id) {
                where.juego_id = req.query.juego_id;
            }   
        const estadisticas = await Partida.findAll({
            where,
            include: [{ model: Juego, attributes: ['nombre'] }],
            order: [['fecha', 'DESC']]
        });
     
        res.json(estadisticas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la evolución de las estadísticas del usuario.' });
    }
});
router.get('/tendencia', auth, async (req, res) => {
    try {
        const juegoId = req.query.juego_id;
        if (!juegoId) {
            return res.status(400).json({ error: 'Falta el parámetro juego_id.' });
        }

        const resultado = await calcularTendencia(req.user.id, juegoId);
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular la tendencia.' });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /estadisticas/dashboard
// ─────────────────────────────────────────────────────────────
// Endpoint agregado que devuelve toda la información necesaria
// para las pestañas Logros y Comparar en una sola petición.
// Razón de diseño: agrupar consultas relacionadas reduce el
// número de round-trips de red, mejorando la experiencia en
// dispositivos con conexión limitada.
router.get('/dashboard', auth, async (req, res) => {
    try {
        const usuarioId = req.user.id;

        // ── 1) Resumen agregado por juego (mismo que /resumen) ─────────
        const resumen = await Partida.findAll({
            where: { usuario_id: usuarioId },
            attributes: [
                'juego_id',
                [sequelize.fn('COUNT', sequelize.col('id_partida')), 'total_partidas'],
                [sequelize.fn('AVG',   sequelize.col('puntuacion')), 'puntuacion_media'],
                [sequelize.fn('MAX',   sequelize.col('puntuacion')), 'mejor_puntuacion'],
                [sequelize.fn('MAX',   sequelize.col('fecha')),      'ultima_partida']
            ],
            include: [{ model: Juego, attributes: ['nombre'] }],
            group: ['partidas.juego_id', 'juego.id_juego']
        });

        // ── 2) Tendencias de los 3 juegos en paralelo ──────────────────
        const idsJuegos = [1, 2, 3];
        const tendencias = await Promise.all(
            idsJuegos.map(async juegoId => {
                const resultado = await calcularTendencia(usuarioId, juegoId);
                return { juego_id: juegoId, ...resultado };
            })
        );

        // ── 3) Marca personal reciente (la más impresionante) ──────────
        const marcaPersonalReciente = await detectarMarcaPersonalReciente(usuarioId, idsJuegos);

        // ── 4) Racha de días consecutivos jugando ──────────────────────
        const rachaDias = await calcularRachaDias(usuarioId);

        res.json({
            resumen,
            tendencias,
            marca_personal_reciente: marcaPersonalReciente,
            racha_dias: rachaDias
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el dashboard de estadísticas.' });
    }
});




module.exports = router;

