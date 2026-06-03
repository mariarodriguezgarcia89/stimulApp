// Rutas protegidas del juego Intruso: devuelve preguntas aleatorias filtradas por nivel
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Intruso, sequelize } = require('../models');

// GET /intrusos/partida — devuelve 3 intrusos aleatorios del nivel indicado
router.get('/partida', auth, async (req, res) => {
    try {
        const { nivel } = req.query;

        if (!nivel || !['facil', 'dificil'].includes(nivel)) {
            return res.status(400).json({ error: 'El parámetro nivel debe ser "facil" o "dificil".' });
        }

        // ORDER BY RAND() garantiza que cada partida reciba intrusos distintos
        const intrusos = await Intruso.findAll({
            where: { nivel },
            order: sequelize.random(),
            limit: 3
        });
        res.json(intrusos);
    } catch (error) {
        console.error('Error al obtener intrusos:', error);
        res.status(500).json({ error: 'Error al obtener los intrusos.' });
    }
});

module.exports = router;
