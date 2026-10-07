const pool = require('./db');
const bcrypt = require('bcryptjs');

async function initDB() {
  console.log('Iniciando configuración de tablas en PostgreSQL...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      rol VARCHAR(50) NOT NULL CHECK (rol IN ('superadmin', 'head_coach', 'assistant_coach', 'student')),
      activo BOOLEAN DEFAULT TRUE NOT NULL,
      temporary_assistant BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE entrenamientos ADD COLUMN IF NOT EXISTS oculto BOOLEAN DEFAULT FALSE;
  `);

  // Verificar si ya hay usuarios
  const res = await pool.query('SELECT COUNT(*) FROM usuarios');
  if (parseInt(res.rows[0].count, 10) === 0) {
    console.log('Sembrando usuarios de prueba iniciales...');

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('123456', salt);

    const usuariosIniciales = [
      ['Super Admin', 'admin@tracker.com', passHash, 'superadmin', true, false],
      ['Head Coach Carlos', 'coach@tracker.com', passHash, 'head_coach', true, false],
      ['Asistente Laura', 'asistente@tracker.com', passHash, 'assistant_coach', true, false],
      ['Alumno Juan', 'juan@tracker.com', passHash, 'student', true, false],
      ['Alumno Pedro (Temp Assistant)', 'pedro@tracker.com', passHash, 'student', true, true],
      ['Alumno Inactivo', 'inactivo@tracker.com', passHash, 'student', false, false]
    ];

    for (const u of usuariosIniciales) {
      await pool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, activo, temporary_assistant) VALUES ($1, $2, $3, $4, $5, $6)',
        u
      );
    }
    console.log('Usuarios iniciales creados exitosamente (Contraseña para todos: 123456).');
  } else {
    console.log(`Tabla usuarios ya cuenta con ${res.rows[0].count} registros.`);
  }

  console.log('Base de datos inicializada correctamente.');
}

if (require.main === module) {
  initDB()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Error inicializando base de datos:', err);
      pool.end();
    });
}

module.exports = initDB;

