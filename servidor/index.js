const express = require('express');
const cors = require('cors');
const pool = require('./db');   // 👈 importamos la conexión

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/entrenamientos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM entrenamientos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/entrenamientos', async (req, res) => {
  const { fecha, tipo, duracionMinutos, notas } = req.body;

  if (!fecha || !tipo || !duracionMinutos) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO entrenamientos (fecha, tipo, "duracionMinutos", notas) VALUES ($1, $2, $3, $4) RETURNING *',
      [fecha, tipo, duracionMinutos, notas || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/entrenamientos/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM entrenamientos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/entrenamientos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { fecha, tipo, duracionMinutos, notas } = req.body;

  if (!fecha || !tipo || !duracionMinutos) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await pool.query(
      'UPDATE entrenamientos SET fecha = $1, tipo = $2, "duracionMinutos" = $3, notas = $4 WHERE id = $5 RETURNING *',
      [fecha, tipo, duracionMinutos, notas ?? '', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/entrenamientos/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query('DELETE FROM entrenamientos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});