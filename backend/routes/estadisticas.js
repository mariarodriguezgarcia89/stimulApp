const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Partida, Estadistica, Juego } = require('../models');

// Obtener estadísticas del usuario
router.get('/resumen', auth, async (req, res) => {
    try {   
        const estadisticas = await Estadistica.findAll({
            where: { usuario_id: req.user.id },
            include: [{ model: Juego, attributes: ['nombre'] }]
        });
        res.json(estadisticas);
    } catch (error) {
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

module.exports = router;

