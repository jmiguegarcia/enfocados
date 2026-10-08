const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'Falta la variable de entorno JWT_SECRET. Defininga en servidor/.env antes de iniciar.'
  );
}

const PERMISOS = {
  superadmin: ['*'],
  head_coach: [
    'workout:write',
    'workout:read_hidden',
    'workout:add_notes',
    'attendance:mark',
    'attendance:view_own',
    'user:view',
    'user:manage_students',
    'user:toggle_temp_assistant'
  ],
  assistant_coach: [
    'workout:read_hidden',
    'workout:add_notes',
    'attendance:mark',
    'attendance:view_own',
    'user:view',
    'user:toggle_temp_assistant'
  ],
  student: [
    'attendance:view_own'
  ]
};

function obtenerRolEfectivo(usuario) {
  if (!usuario) return 'guest';
  if (usuario.rol === 'student' && usuario.temporary_assistant) {
    return 'assistant_coach';
  }
  return usuario.rol;
}

function tienePermiso(usuario, permiso) {
  if (!usuario || !usuario.activo) return false;
  if (usuario.rol === 'superadmin') return true;

  const rolEfectivo = obtenerRolEfectivo(usuario);
  const lista = PERMISOS[rolEfectivo] || [];
  return lista.includes('*') || lista.includes(permiso);
}

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  try {
    const decodificado = jwt.verify(token, JWT_SECRET);

    // Consultamos el usuario en la BD para validar estado activo y permisos en tiempo real
    const result = await pool.query(
      'SELECT id, nombre, email, rol, activo, temporary_assistant FROM usuarios WHERE id = $1',
      [decodificado.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requerirPermiso(permiso) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!tienePermiso(req.usuario, permiso)) {
      return res.status(403).json({ error: `Permiso insuficiente: se requiere '${permiso}'` });
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  PERMISOS,
  obtenerRolEfectivo,
  tienePermiso,
  generarToken,
  autenticarToken,
  requerirPermiso
};

