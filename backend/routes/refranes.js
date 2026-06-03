// Rutas protegidas del juego Refranes: devuelve preguntas aleatorias para cada partida
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Refran, sequelize } = require('../models');

// GET /refranes/partida — devuelve 10 refranes aleatorios (ORDER BY RAND())
router.get('/partida', auth, async (req, res) => {
    try {
        const refranes = await Refran.findAll({
            order: sequelize.random(),
            limit: 10
        });
        res.json(refranes);
    } catch (error) {
        console.error('Error al obtener refranes:', error);
        res.status(500).json({ error: 'Error al obtener los refranes.' });
    }
});

module.exports = router;
