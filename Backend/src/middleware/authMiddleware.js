const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (En producción, esto va en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_ut_tehuacan';

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // El token suele venir como "Bearer eyJhbGciOi..."
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere token' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Guardamos los datos del usuario en la petición
    next(); // Dejamos pasar a la siguiente función
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar si es Admin
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de Administrador' });
  }
};

module.exports = { verifyToken, verifyAdmin, JWT_SECRET };