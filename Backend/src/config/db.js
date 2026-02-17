const { Pool } = require('pg');
require('dotenv').config();

// Configuración de conexión con fallback para desarrollo local
const connectionString = process.env.DATABASE_URL || 'postgres://admin:password123@localhost:5432/ut_grades_db';

const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {

  console.log('Base de datos conectada');
});

pool.on('error', (err) => {
  console.error('Error inesperado en cliente de BD', err);
  process.exit(-1);
});

module.exports = pool;