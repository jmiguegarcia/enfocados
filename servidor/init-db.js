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
      rol VARCHAR(50) NOT NULL CHECK (rol IN ('superadmin', 'admin', 'head_coach', 'assistant_coach', 'student')),
      activo BOOLEAN DEFAULT TRUE NOT NULL,
      temporary_assistant BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Actualizar el CHECK constraint para permitir el rol 'admin' en bases de datos existentes
  await pool.query(`
    ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
    ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('superadmin', 'admin', 'head_coach', 'assistant_coach', 'student'));
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
      ['Admin Deportes', 'admin.deportes@tracker.com', passHash, 'admin', true, false],
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
    // Si ya existen usuarios, asegurar que el usuario admin.deportes@tracker.com exista
    const adminCheck = await pool.query('SELECT id FROM usuarios WHERE email = $1', ['admin.deportes@tracker.com']);
    if (adminCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passHash = await bcrypt.hash('123456', salt);
      await pool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, activo, temporary_assistant) VALUES ($1, $2, $3, $4, $5, $6)',
        ['Admin Deportes', 'admin.deportes@tracker.com', passHash, 'admin', true, false]
      );
      console.log('Usuario admin de prueba (admin.deportes@tracker.com) creado exitosamente.');
    }
    console.log(`Tabla usuarios cuenta con registros.`);
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
