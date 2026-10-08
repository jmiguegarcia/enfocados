require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const initDB = require('./init-db');

const authRutas = require('./rutas/auth');
const usuariosRutas = require('./rutas/usuarios');
const entrenamientosRutas = require('./rutas/entrenamientos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Montar rutas
app.use('/api/auth', authRutas);
app.use('/api/usuarios', usuariosRutas);
app.use('/api/entrenamientos', entrenamientosRutas);

// Ruta base informativa
app.get('/api', (req, res) => {
  res.json({
    app: 'Training Tracker API',
    version: '2.0.0',
    estado: 'activo'
  });
});

async function iniciarServidor() {
  try {
    // Asegura que las tablas y usuarios de prueba existan
    await initDB();

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();