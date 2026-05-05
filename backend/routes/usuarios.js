const express = require('express');
const router = express.Router(); 
const auth = require('../middleware/auth');
const { Usuario } = require('../models');  

// GET /usuarios/me
// Devuelve los datos del usuario actualmente autenticado
// Ruta protegida: requiere token JWT válido en la cabecera Authorization
router.get('/me', auth, async (req, res) => {
    try {
        // findByPk es equivalente a SELECT * FROM usuarios WHERE id_usuario = ?
        // attributes: { exclude } le dice a Sequelize que devuelva todos los campos
        // excepto password_hash, que nunca debe exponerse en una respuesta de la API.
        const user = await Usuario.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });

        // Si el id del token no corresponde a ningún usuario, findByPk devuelve null
        // y el cliente recibe un 200 con body null. En una mejora futura se podría añadir:
        // if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
        res.json(user);

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener el usuario.' });
    }
});

// PUT /usuarios/me 
// Actualiza los datos del perfil del usuario autenticado
// Ruta protegida: requiere token JWT válido en la cabecera Authorization
router.put('/me', auth, async (req, res) => {
    try {
        // Extraemos del body solo los campos que el usuario tiene permitido modificar
        // El email y el password_hash no están incluidos
        const { nombre, apellidos, fecha_nacimiento, foto_perfil, email_cuidador, nombre_cuidador, password } = req.body;

        const datosActualizar = { nombre, apellidos, fecha_nacimiento, foto_perfil, email_cuidador, nombre_cuidador };

        if (password) {
            const bcrypt = require('bcryptjs');
            datosActualizar.password_hash = await bcrypt.hash(password, 10);
        }

        await Usuario.update(datosActualizar, { where: { id_usuario: req.user.id } });

        res.json({ message: 'Usuario actualizado exitosamente.' });

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
});

module.exports = router;