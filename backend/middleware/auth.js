// Importamos jsonwebtoken para poder verificar los tokens JWT que llegan en las peticiones
const jwt = require('jsonwebtoken');

// Middleware de autenticación
const auth = (req, res, next) => {
    try {
        // Extraemos el token de la cabecera Authorization.
        // El formato esperado es: "Bearer <token>", así que eliminamos el prefijo "Bearer ".
        // Si no viene la cabecera Authorization, req.header() devuelve undefined
        // y el .replace() lanza un TypeError, que captura el catch de abajo.
        const token = req.header('Authorization').replace('Bearer ', '');

        // Comprobación defensiva por si el token llega vacío tras el replace.
        if (!token) {
            return res.status(401).json({ error: 'Por favor, autentícate.' });
        }

        // Verificamos el token con el mismo secreto que se usó para firmarlo en el login.
        // Si el token es válido, jwt.verify() devuelve el payload decodificado
        // Si el token es inválido, está expirado o ha sido manipulado, lanza un error
        // que captura el catch y devuelve 401.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guardamos el payload decodificado en req.user para que las rutas protegidas
        // puedan acceder al id del usuario
        req.user = decoded;

        // Llamamos a next() para pasar el control a la siguiente función de la cadena,
        // que será la ruta protegida que corresponda.
        next();

    } catch (error) {
        // Cualquier error en la verificación del token (token inválido, expirado,
        // cabecera ausente) llega aquí. Siempre respondemos con 401.
        console.log('Error en el middleware:', error.message);
        res.status(401).json({ error: 'Por favor, autentícate.' });
    }
};

module.exports = auth;