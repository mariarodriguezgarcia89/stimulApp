// Rutas protegidas de partidas: guarda resultados y actualiza estadísticas tras cada sesión
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Partida, Estadistica, Juego, Usuario } = require('../models');
const { enviarCorreoAlCuidador } = require('../services/emailService');

// Umbral para alertar al cuidador si la media de las últimas 3 partidas baja al 40% de la media histórica
const UMBRAL_ALERTA_CUIDADOR = 0.4;

// GET /partidas/mis-partidas — devuelve todas las partidas del usuario autenticado
router.get('/mis-partidas', auth, async (req, res) => {
    try {
        const partidas = await Partida.findAll({
            where: { usuario_id: req.user.id },
        });
        res.json(partidas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las partidas del usuario.' });
    }
});

// POST /partidas/nueva-partida — guarda la partida y actualiza estadísticas; alerta al cuidador si hay bajada significativa
router.post('/nueva-partida', auth, async (req, res) => {
    try {
        const { juego_id, puntuacion, duracion_segundos, nivel, completada } = req.body;

        // Validación de los parámetros de entrada
        const JUEGOS_VALIDOS = [1, 2, 3];
        const NIVELES_VALIDOS = ['facil', 'dificil'];
        const MAX_PUNTUACION = { 1: 100, 2: 30, 3: 80 };

        if (!JUEGOS_VALIDOS.includes(Number(juego_id)))
            return res.status(400).json({ error: 'Juego no válido.' });
        if (!NIVELES_VALIDOS.includes(nivel))
            return res.status(400).json({ error: 'Nivel no válido.' });
        if (!Number.isInteger(Number(puntuacion)) || Number(puntuacion) < 0 || Number(puntuacion) > MAX_PUNTUACION[Number(juego_id)])
            return res.status(400).json({ error: 'Puntuación no válida.' });

        const nuevaPartida = await Partida.create({
            usuario_id: req.user.id,
            juego_id,
            puntuacion,
            duracion_segundos,
            nivel,
            completada,
            fecha: new Date()
        });

        // Crea la fila de estadísticas si es la primera partida del usuario en este juego, o la actualiza
        const [estadisticaUsuario, creada] = await Estadistica.findOrCreate({
            where: { usuario_id: req.user.id, juego_id: juego_id },
            defaults: {
                mejor_puntuacion: puntuacion,
                total_partidas: 1,
                puntuacion_media: puntuacion,
                ultima_partida: new Date()
            }
        });

        if (!creada) {
            const mediaAnterior = estadisticaUsuario.puntuacion_media;

            await estadisticaUsuario.update({
                total_partidas: estadisticaUsuario.total_partidas + 1,
                puntuacion_media: (estadisticaUsuario.puntuacion_media * estadisticaUsuario.total_partidas + puntuacion) / (estadisticaUsuario.total_partidas + 1),
                mejor_puntuacion: Math.max(estadisticaUsuario.mejor_puntuacion, puntuacion),
                ultima_partida: new Date()
            });

            // Comprueba si las últimas 3 partidas muestran una caída significativa respecto a la media histórica
            const ultimasPartidas = await Partida.findAll({
                where: { usuario_id: req.user.id, juego_id },
                order: [['fecha', 'DESC']],
                limit: 3
            });

            if (mediaAnterior > 0 && ultimasPartidas.length === 3) {
                const mediaUltimas = Math.round(
                    ultimasPartidas.reduce((sum, p) => sum + p.puntuacion, 0) / 3
                );
                if (mediaUltimas < mediaAnterior * UMBRAL_ALERTA_CUIDADOR) {
                    const juego = await Juego.findByPk(juego_id);
                    const nombreJuego = juego ? juego.nombre : 'el juego';
                    const usuario = await Usuario.findByPk(req.user.id);
                    await enviarCorreoAlCuidador(usuario.email_cuidador, usuario.nombre, nombreJuego, mediaUltimas, mediaAnterior);
                }
            }
        }

        res.json(nuevaPartida);

    } catch (error) {
        console.error('Error al guardar partida:', error);
        res.status(500).json({ error: 'Error al guardar la partida.' });
    }
});

module.exports = router;
