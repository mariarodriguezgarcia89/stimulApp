const express = require('express');
const router = express.Router(); 
const auth = require('../middleware/auth');
const { Intruso, sequelize } = require('../models');

// GET /intrusos/partida
// Devuelve una lista de 3 intrusos aleatorios para el juego de encontrar el intruso
// Ruta protegida: requiere token JWT válido en la cabecera Authorization
router.get('/partida', auth, async (req, res) => { 
    try {

        const { nivel } = req.query;

        if (!nivel || !['facil', 'dificil'].includes(nivel)) {
            return res.status(400).json({ error: 'El parámetro nivel debe ser "facil" o "dificil".' });
        }
        // findAll con order: sequelize.random() genera una consulta SQL con ORDER BY RAND()
        // limit: 10 limita el resultado a 10 filas.
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
