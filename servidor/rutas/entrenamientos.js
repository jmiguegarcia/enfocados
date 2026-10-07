const express = require('express');
const pool = require('../db');
const {
  autenticarToken,
  requerirPermiso,
  tienePermiso
} = require('../middleware/auth');

const router = express.Router();

// GET /api/entrenamientos
router.get('/', autenticarToken, async (req, res) => {
  try {
    const puedeVerOcultos = tienePermiso(req.usuario, 'workout:read_hidden');

    let query = 'SELECT * FROM entrenamientos ORDER BY id';
    if (!puedeVerOcultos) {
      // Los alumnos sin permiso workout:read_hidden solo ven los liberados (no ocultos)
      query = 'SELECT * FROM entrenamientos WHERE (oculto IS NULL OR oculto = false) ORDER BY id';
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener entrenamientos:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/entrenamientos/:id
router.get('/:id', autenticarToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM entrenamientos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    const entrenamiento = result.rows[0];
    const puedeVerOcultos = tienePermiso(req.usuario, 'workout:read_hidden');

    if (entrenamiento.oculto && !puedeVerOcultos) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    res.json(entrenamiento);
  } catch (err) {
    console.error('Error al obtener entrenamiento:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/entrenamientos (Requiere workout:write -> head_coach, superadmin)
router.post('/', autenticarToken, requerirPermiso('workout:write'), async (req, res) => {
  const { fecha, tipo, duracionMinutos, notas, oculto } = req.body;

  if (!fecha || !tipo || !duracionMinutos) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO entrenamientos (fecha, tipo, "duracionMinutos", notas, oculto) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fecha, tipo, duracionMinutos, notas || '', Boolean(oculto)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear entrenamiento:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/entrenamientos/:id (head_coach/superadmin edita todo; assistant_coach solo añade/edita notas)
router.put('/:id', autenticarToken, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const existe = await pool.query('SELECT * FROM entrenamientos WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    const { fecha, tipo, duracionMinutos, notas, oculto } = req.body;
    const puedeEditarPlan = tienePermiso(req.usuario, 'workout:write');
    const puedeEditarNotas = tienePermiso(req.usuario, 'workout:add_notes');

    if (!puedeEditarPlan && !puedeEditarNotas) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este entrenamiento' });
    }

    let result;
    if (puedeEditarPlan) {
      // Head coach o Superadmin: edita todo el plan
      if (!fecha || !tipo || !duracionMinutos) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      result = await pool.query(
        'UPDATE entrenamientos SET fecha = $1, tipo = $2, "duracionMinutos" = $3, notas = $4, oculto = $5 WHERE id = $6 RETURNING *',
        [fecha, tipo, duracionMinutos, notas ?? '', Boolean(oculto), id]
      );
    } else {
      // Assistant coach o student temporal: solo añade/edita notas, sin modificar el plan
      result = await pool.query(
        'UPDATE entrenamientos SET notas = $1 WHERE id = $2 RETURNING *',
        [notas ?? '', id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar entrenamiento:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/entrenamientos/:id (Requiere workout:write -> head_coach, superadmin)
router.delete('/:id', autenticarToken, requerirPermiso('workout:write'), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query('DELETE FROM entrenamientos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar entrenamiento:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

