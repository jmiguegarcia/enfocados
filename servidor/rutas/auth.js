const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const {
  generarToken,
  autenticarToken,
  obtenerRolEfectivo,
  PERMISOS
} = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'El email y la contraseña son obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, password_hash, rol, activo, temporary_assistant FROM usuarios WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];

    // Requisito 6: Bloquear inicio de sesión si activo === false
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Tu cuenta está desactivada. Contacta al administrador.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);

    const usuarioResp = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      rolEfectivo: obtenerRolEfectivo(usuario),
      activo: usuario.activo,
      temporary_assistant: usuario.temporary_assistant
    };

    res.json({
      token,
      usuario: usuarioResp
    });
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

// POST /api/auth/registro (Registro público como student)
router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const existe = await pool.query(
      'SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevo = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, activo, temporary_assistant)
       VALUES ($1, $2, $3, 'student', true, false)
       RETURNING id, nombre, email, rol, activo, temporary_assistant`,
      [nombre.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const usuario = nuevo.rows[0];
    const token = generarToken(usuario);

    res.status(201).json({
      token,
      usuario: {
        ...usuario,
        rolEfectivo: obtenerRolEfectivo(usuario)
      }
    });
  } catch (err) {
    console.error('Error en /api/auth/registro:', err);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
});

// GET /api/auth/me (Datos de sesión actual)
router.get('/me', autenticarToken, async (req, res) => {
  const rolEfectivo = obtenerRolEfectivo(req.usuario);
  const permisos = PERMISOS[rolEfectivo] || [];

  res.json({
    usuario: {
      ...req.usuario,
      rolEfectivo,
      permisos: req.usuario.rol === 'superadmin' ? ['*'] : permisos
    }
  });
});

// POST /api/auth/impersonar/:id (Solo superadmin)
router.post('/impersonar/:id', autenticarToken, async (req, res) => {
  if (req.usuario.rol !== 'superadmin') {
    return res.status(403).json({ error: 'Solo el superadmin puede impersonar usuarios' });
  }

  const targetId = Number(req.params.id);

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, activo, temporary_assistant FROM usuarios WHERE id = $1',
      [targetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario a impersonar no encontrado' });
    }

    const targetUser = result.rows[0];
    const token = generarToken(targetUser);

    res.json({
      token,
      usuario: {
        ...targetUser,
        rolEfectivo: obtenerRolEfectivo(targetUser)
      },
      impersonando: true
    });
  } catch (err) {
    console.error('Error en /api/auth/impersonar:', err);
    res.status(500).json({ error: 'Error al impersonar usuario' });
  }
});

module.exports = router;

