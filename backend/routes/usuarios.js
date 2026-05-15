const express = require('express');
const router = express.Router(); 
const auth = require('../middleware/auth');
const { Usuario } = require('../models');  
const bcrypt = require('bcryptjs')

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

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
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

        if (email_cuidador && !/\S+@\S+\.\S+/.test(email_cuidador)) {
            return res.status(400).json({ error: 'El formato del correo del cuidador no es válido.' })
        }

        if (password && password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
        }

        const datosActualizar = { nombre, apellidos, fecha_nacimiento, foto_perfil, email_cuidador, nombre_cuidador };

        if (password) {
            datosActualizar.password_hash = await bcrypt.hash(password, 10);
        }

        await Usuario.update(datosActualizar, { where: { id_usuario: req.user.id } });

        res.json({ mensaje: 'Usuario actualizado exitosamente.' });

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
});

// DELETE /usuarios/me
// Desactiva la cuenta del usuario autenticado (borrado lógico)
// Ruta protegida: requiere token JWT válido en la cabecera Authorization
router.delete('/me', auth, async (req, res) => {
    try {
        await Usuario.update(
            { activo: false },
            { where: { id_usuario: req.user.id } }
        );

        res.json({ mensaje: 'Cuenta desactivada correctamente.' });

    } catch (error) {
        console.error('Error al desactivar la cuenta:', error);
        res.status(500).json({ error: 'Error al desactivar la cuenta.' });
    }
});



module.exports = router;