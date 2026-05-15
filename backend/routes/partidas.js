const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Partida, Estadistica, Juego, Usuario } = require('../models');
const { enviarCorreoAlCuidador } = require('../services/emailService');
const UMBRAL_ALERTA_CUIDADOR = 0.4  // Se alerta si la puntuación baja al 40% de la media

// Obtener partidas del usuario
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

// Crear nueva partida
router.post('/nueva-partida', auth, async (req, res) => {
  try {
    const { juego_id, puntuacion, duracion_segundos, nivel, completada } = req.body;

    const JUEGOS_VALIDOS = [1, 2, 3]
    const NIVELES_VALIDOS = ['facil', 'dificil']
    const MAX_PUNTUACION = { 1: 100, 2: 30, 3: 80 }

    if (!JUEGOS_VALIDOS.includes(Number(juego_id)))
      return res.status(400).json({ error: 'Juego no válido.' })
    if (!NIVELES_VALIDOS.includes(nivel))
      return res.status(400).json({ error: 'Nivel no válido.' })
    if (!Number.isInteger(Number(puntuacion)) || Number(puntuacion) < 0 || Number(puntuacion) > MAX_PUNTUACION[Number(juego_id)])
      return res.status(400).json({ error: 'Puntuación no válida.' })

    const nuevaPartida = await Partida.create({
      usuario_id: req.user.id,
      juego_id,
        puntuacion,
        duracion_segundos,
        nivel,
        completada,
        fecha: new Date()
    });

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
    const mediaAnterior = estadisticaUsuario.puntuacion_media  // ← ANTES del update

    await estadisticaUsuario.update({
        total_partidas: estadisticaUsuario.total_partidas + 1,
        puntuacion_media: (estadisticaUsuario.puntuacion_media * estadisticaUsuario.total_partidas + puntuacion) / (estadisticaUsuario.total_partidas + 1),
        mejor_puntuacion: Math.max(estadisticaUsuario.mejor_puntuacion, puntuacion),
        ultima_partida: new Date()
    });

    if (mediaAnterior > 0 && puntuacion < mediaAnterior * UMBRAL_ALERTA_CUIDADOR) {
        const juego = await Juego.findByPk(juego_id);
        const nombreJuego = juego ? juego.nombre : 'el juego';
        const usuario = await Usuario.findByPk(req.user.id);
        await enviarCorreoAlCuidador(usuario.email_cuidador, usuario.nombre, nombreJuego, puntuacion, mediaAnterior);
    }   
}

    res.json(nuevaPartida);
    
  } catch (error) {
      console.error('Error al guardar partida:', error)
      res.status(500).json({ error: 'Error al guardar la partida.' })
}
});

module.exports = router;