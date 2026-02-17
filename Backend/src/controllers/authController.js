const pool = require('../config/db');
const jwt = require('jsonwebtoken');
// Importamos la clave secreta definida en el middleware
const { JWT_SECRET } = require('../middleware/authMiddleware');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Buscamos al usuario por email
    const result = await pool.query(
      'SELECT id, full_name, email, role, matricula, password FROM users WHERE email = $1', 
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // VERIFICACIÓN DE CONTRASEÑAd)'
    if (password !== user.password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // GENERACIÓN DEL TOKEN
    // Guardamos datos útiles dentro del token para no tener que consultar la BD a cada rato
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.full_name
      },
      JWT_SECRET,
      { expiresIn: '8h' } // El token caduca en 8 horas (jornada laboral/escolar)
    );

    // Quitamos el password del objeto usuario antes de enviarlo al frontend por seguridad
    delete user.password;

    res.json({ 
      message: 'Login exitoso', 
      user,
      token 
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { login };