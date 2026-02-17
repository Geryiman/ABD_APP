const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importar Rutas
const appRoutes = require('./src/routes/routes');

const app = express();
const PORT = process.env.PORT || 3006;

// 2. Middlewares Globales
app.use(cors());          // Permite que el Frontend (React) hable con el Backend
app.use(express.json());  // Permite leer los JSON que envían los usuarios

// 3. Definición de Rutas
app.use('/api', appRoutes);

// 4. Ruta de prueba
app.get('/', (req, res) => {
  res.send(`
    <h1>API Sistema Escolar UT Tehuacán</h1>
    <p>Estado: En línea</p>
    <p>Puerto: ${PORT}</p>
  `);
});

// 5. Iniciar Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});