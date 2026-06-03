// Middleware que verifica el token JWT de cada petición y protege las rutas privadas
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Extrae el token de la cabecera Authorization (formato esperado: "Bearer <token>")
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Por favor, autentícate.' });
        }

        // Verifica la firma y la expiración del token con el secreto del .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjunta el payload decodificado a req.user para que las rutas lo usen
        req.user = decoded;

        next();

    } catch (error) {
        // Token inválido, expirado o cabecera ausente: siempre responde con 401
        console.log('Error en el middleware:', error.message);
        res.status(401).json({ error: 'Por favor, autentícate.' });
    }
};

// Exportación para aplicar como middleware en las rutas protegidas
module.exports = auth;
