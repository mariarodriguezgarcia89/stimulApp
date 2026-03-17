const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const partida = require('../models/Partida');
const estadistica = require('../models/Estadistica');

// Obtener partidas del usuario
router.get('/mis-partidas', auth, async (req, res) => {
  try {
    const partidas = await partida.findAll({
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
    const nuevaPartida = await partida.create({
      usuario_id: req.user.id,
      juego_id,
        puntuacion,
        duracion_segundos,
        nivel,
        completada,
        fecha: new Date()
    });

    console.log('Llegamos al findOrCreate', req.user.id, juego_id);
    const [estadisticaUsuario, creada] = await estadistica.findOrCreate({
    where: { usuario_id: req.user.id, juego_id: juego_id },
    defaults: { 
        mejor_puntuacion: puntuacion, 
        total_partidas: 1,
        puntuacion_media: puntuacion,
        ultima_partida: new Date()
    }
    });

    if (!creada) {
    // el registro ya existía, hay que actualizarlo
        await estadisticaUsuario.update({
            total_partidas: estadisticaUsuario.total_partidas + 1,
            puntuacion_media: (estadisticaUsuario.puntuacion_media * estadisticaUsuario.total_partidas + puntuacion) / (estadisticaUsuario.total_partidas + 1),
            mejor_puntuacion: Math.max(estadisticaUsuario.mejor_puntuacion, puntuacion),
            ultima_partida: new Date()
        });
    }

    res.json(nuevaPartida);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;