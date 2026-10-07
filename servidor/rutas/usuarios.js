const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const {
  autenticarToken,
  obtenerRolEfectivo
} = require('../middleware/auth');

const router = express.Router();

// GET /api/usuarios (superadmin, head_coach, assistant_coach, o student con temporary_assistant)
router.get('/', autenticarToken, async (req, res) => {
  const rolEfectivo = obtenerRolEfectivo(req.usuario);

  if (!['superadmin', 'head_coach', 'assistant_coach'].includes(rolEfectivo)) {
    return res.status(403).json({ error: 'Acceso denegado: no tienes permisos para ver usuarios' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, activo, temporary_assistant, created_at FROM usuarios ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// POST /api/usuarios (Crear usuario: superadmin o head_coach)
router.post('/', autenticarToken, async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const rolesPermitidos = ['superadmin', 'head_coach', 'assistant_coach', 'student'];
  if (!rolesPermitidos.includes(rol)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }

  // Restricción según quién crea
  if (req.usuario.rol === 'head_coach' && (rol === 'superadmin' || rol === 'head_coach')) {
    return res.status(403).json({ error: 'Un head_coach solo puede crear alumnos o asistentes' });
  }

  if (req.usuario.rol !== 'superadmin' && req.usuario.rol !== 'head_coach') {
    return res.status(403).json({ error: 'No tienes permisos para crear usuarios' });
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, activo, temporary_assistant)
       VALUES ($1, $2, $3, $4, true, false)
       RETURNING id, nombre, email, rol, activo, temporary_assistant, created_at`,
      [nombre.trim(), email.trim().toLowerCase(), passwordHash, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PATCH /api/usuarios/:id/temporary-assistant (superadmin, head_coach, assistant_coach)
router.patch('/:id/temporary-assistant', autenticarToken, async (req, res) => {
  const id = Number(req.params.id);
  const { temporary_assistant } = req.body;

  if (typeof temporary_assistant !== 'boolean') {
    return res.status(400).json({ error: 'temporary_assistant debe ser un valor booleano (true/false)' });
  }

  const rolEfectivo = obtenerRolEfectivo(req.usuario);
  if (!['superadmin', 'head_coach', 'assistant_coach'].includes(rolEfectivo)) {
    return res.status(403).json({ error: 'No tienes permisos para modificar temporary_assistant' });
  }

  try {
    const usuarioDestino = await pool.query('SELECT id, rol FROM usuarios WHERE id = $1', [id]);
    if (usuarioDestino.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Requisito 4: Solo aplica para usuarios con rol 'student'
    if (usuarioDestino.rows[0].rol !== 'student') {
      return res.status(400).json({ error: 'El permiso temporary_assistant solo aplica para alumnos (student)' });
    }

    const result = await pool.query(
      'UPDATE usuarios SET temporary_assistant = $1 WHERE id = $2 RETURNING id, nombre, email, rol, activo, temporary_assistant',
      [temporary_assistant, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar temporary_assistant:', err);
    res.status(500).json({ error: 'Error al actualizar permisos temporales' });
  }
});

// PATCH /api/usuarios/:id/activo (Activar / desactivar cuenta)
router.patch('/:id/activo', autenticarToken, async (req, res) => {
  const id = Number(req.params.id);
  const { activo } = req.body;

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'activo debe ser un valor booleano (true/false)' });
  }

  try {
    const usuarioDestino = await pool.query('SELECT id, rol FROM usuarios WHERE id = $1', [id]);
    if (usuarioDestino.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const targetUser = usuarioDestino.rows[0];

    // No permitir desactivar la propia cuenta
    if (req.usuario.id === id && !activo) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    // superadmin puede activar/desactivar entrenadores y alumnos
    // head_coach solo puede activar/desactivar alumnos
    if (req.usuario.rol === 'superadmin') {
      // permitido
    } else if (req.usuario.rol === 'head_coach') {
      if (targetUser.rol !== 'student') {
        return res.status(403).json({ error: 'Un head_coach solo puede activar o desactivar alumnos (student)' });
      }
    } else {
      return res.status(403).json({ error: 'No tienes permisos para modificar el estado de usuarios' });
    }

    const result = await pool.query(
      'UPDATE usuarios SET activo = $1 WHERE id = $2 RETURNING id, nombre, email, rol, activo, temporary_assistant',
      [activo, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar estado de usuario:', err);
    res.status(500).json({ error: 'Error al cambiar estado de cuenta' });
  }
});

module.exports = router;

