const express = require('express');

// Creamos un router de Express para agrupar las rutas de autenticación.
// Se monta en app.js con el prefijo /auth.
const router = express.Router(); 

// Librería para hashear contraseñas. Nunca se guarda una contraseña en texto plano en la base de datos
const bcrypt = require('bcryptjs'); 

// Librería para generar y verificar tokens JWT
const jwt = require('jsonwebtoken'); 

// Leemos el secreto JWT desde las variables de entorno
// Se usa para firmar los tokens: solo el servidor que conoce este secreto puede verificarlos
const JWT_SECRET = process.env.JWT_SECRET;

// Importamos el modelo Usuario desde models/index.js 
// A través de él hacemos todas las operaciones con la tabla usuarios sin escribir SQL.
const { Usuario } = require('../models');

// POST /auth/register 
// Registra un nuevo usuario en la base de datos
// Ruta pública: no requiere token JWT
router.post('/register', async (req, res) => {

    // Extraemos los campos necesarios del body de la petición.
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
        // Comprobamos si ya existe un usuario con ese email.
        // findOne devuelve el primer registro que coincida con el where, o null si no hay
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Este correo electrónico ya está registrado. Si ya tiene una cuenta, puede iniciar sesión pulsando en "Inicia sesión aquí".' });
        }

        // Hasheamos la contraseña antes de guardarla.
        // El segundo parámetro (10) es el número de "salt rounds": cuántas veces se aplica
        // el algoritmo. A mayor número, más seguro pero más lento. 10 es el valor estándar.
        // bcrypt es irreversible: no se puede obtener la contraseña original a partir del hash.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creamos el nuevo usuario en la base de datos.
        // Guardamos password_hash (el hash), nunca la contraseña original.
        const newUser = await Usuario.create({ 
            nombre, 
            apellidos,
            email, 
            password_hash: hashedPassword,
            fecha_nacimiento,
            nombre_cuidador,
            email_cuidador
        });

        // Respondemos con 201 Created. No devolvemos el usuario creado para no exponer datos.
        res.status(201).json({ error: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


// POST /auth/login
// Inicia sesión y devuelve un token JWT si las credenciales son correctas
// Ruta pública: no requiere token JWT
router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {
        // Buscamos el usuario por email.
        const user = await Usuario.findOne({ where: { email } });

        // Si el usuario no existe, respondemos con "Credenciales inválidas".
        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        if (!user.activo) {
            return res.status(403).json({ error: 'Esta cuenta ha sido desactivada' });
        }

        // Comparamos la contraseña recibida con el hash guardado en la BD
        // bcrypt.compare() 
        // Nunca desencripta: compara hash con hash
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Las credenciales son correctas: generamos el token JWT
        // El token expira en 1 hora: pasado ese tiempo el usuario tendrá que volver a hacer login.
        const token = jwt.sign({ id: user.id_usuario }, JWT_SECRET, { expiresIn: '1h' });

        // Devolvemos el token al cliente. El frontend lo guardará y lo enviará
        // en la cabecera Authorization de cada petición protegida.
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

module.exports = router;