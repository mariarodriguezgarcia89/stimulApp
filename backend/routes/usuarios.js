const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const usuario = require('../models/usuario');

// Obtener usuario
router.get('/me', auth, async (req, res) => {
  try {
    const user = await usuario.findByPk((req.user.id), {
      attributes: { exclude: ['password_hash'] }
    }); 

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

//Actualizar usuario
router.put('/me', auth, async (req, res) => {
  try {
    const { nombre, apellidos, fecha_nacimiento, foto_perfil, email_cuidador,  nombre_cuidador } = req.body;
    await usuario.update(
      { nombre, apellidos, fecha_nacimiento, foto_perfil, email_cuidador,  nombre_cuidador },
      { where: { id_usuario: req.user.id } }
    );
    res.json({ message: 'Usuario actualizado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
});

module.exports = router;

