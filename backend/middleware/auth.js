const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try{
    const token = req.header('Authorization').replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Por favor, autentícate.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;
    next();
} catch (error) {
    console.log('Error en el middleware:', error.message);
    res.status(401).json({ error: 'Por favor, autentícate.' });
}
};

module.exports = auth;