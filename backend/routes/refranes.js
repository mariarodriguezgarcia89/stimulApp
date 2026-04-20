const express = require('express');
const router = express.Router(); 
const auth = require('../middleware/auth');
const { Refran, sequelize } = require('../models');

// GET /refranes/partida
// Devuelve una lista de 10 refranes aleatorios para el juego de adivinar el refrán
// Ruta protegida: requiere token JWT válido en la cabecera Authorization
router.get('/partida', auth, async (req, res) => { 
    try {
        // findAll con order: sequelize.random() genera una consulta SQL con ORDER BY RAND()
        // limit: 10 limita el resultado a 10 filas.
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
