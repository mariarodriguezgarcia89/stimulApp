// Rutas públicas de autenticación: registro, login y comprobación de email
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// POST /auth/register — crea un nuevo usuario tras validar los campos del body
router.post('/register', async (req, res) => {

    const { nombre, apellidos, email, password, fecha_nacimiento, nombre_cuidador, email_cuidador } = req.body;

    if (!nombre || !apellidos || !email || !password || !fecha_nacimiento) {
        return res.status(400).json({ error: 'Por favor, complete todos los campos obligatorios.' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (email_cuidador && !/\S+@\S+\.\S+/.test(email_cuidador)) {
        return res.status(400).json({ error: 'El formato del correo del cuidador no es válido.' });
    }

    const fechaNac = new Date(fecha_nacimiento)
    const hoy = new Date()
    const anioNacimiento = fechaNac.getFullYear()
    if (isNaN(fechaNac.getTime()) || anioNacimiento < 1900 || fechaNac >= hoy) {
        return res.status(400).json({ error: 'La fecha de nacimiento no es válida.' })
    }

    try {
        // Verifica que el email no esté ya registrado
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Este correo electrónico ya está registrado. Si ya tiene una cuenta, puede iniciar sesión pulsando en "Inicia sesión aquí".' });
        }

        // Hashea la contraseña antes de guardarla (bcrypt es irreversible)
        const hashedPassword = await bcrypt.hash(password, 10);

        await Usuario.create({
            nombre,
            apellidos,
            email,
            password_hash: hashedPassword,
            fecha_nacimiento,
            nombre_cuidador,
            email_cuidador
        });

        res.status(201).json({ error: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// POST /auth/login — valida credenciales y devuelve un token JWT con expiración de 1 hora
router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await Usuario.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        if (!user.activo) {
            return res.status(403).json({ error: 'Esta cuenta ha sido desactivada' });
        }

        // Compara la contraseña recibida con el hash almacenado en la BD
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: user.id_usuario }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            nombre: user.nombre,
            foto_perfil: user.foto_perfil
        });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// GET /auth/check-email — comprueba si un email ya está registrado
router.get('/check-email', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email requerido' });
    try {
        const existingUser = await Usuario.findOne({ where: { email } });
        res.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Error al comprobar email:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
