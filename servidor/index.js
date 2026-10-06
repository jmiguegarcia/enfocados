const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const entrenamientos = [
  {
    id: 1,
    fecha: '2026-10-05',
    tipo: 'Fuerza',
    duracionMinutos: 45,
    notas: 'Entrenamiento inicial'
  }
];
    
app.get('/api/entrenamientos', (req, res) => {
  res.json(entrenamientos);
});

let nextId = 2;

app.post('/api/entrenamientos', (req, res) => {
  const { fecha, tipo, duracionMinutos, notas } = req.body;

  if (!fecha || !tipo || !duracionMinutos) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const nuevoEntrenamiento = {
    id: nextId++,
    fecha,
    tipo,
    duracionMinutos,
    notas: notas || ''
  };

  entrenamientos.push(nuevoEntrenamiento);
  res.status(201).json(nuevoEntrenamiento);
});

app.delete('/api/entrenamientos/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = entrenamientos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  }

  entrenamientos.splice(index, 1);
  res.status(204).send();
});

app.put('/api/entrenamientos/:id', (req, res) => {
  const id = Number(req.params.id);
  const entrenamiento = entrenamientos.find(t => t.id === id);

  if (!entrenamiento) {
    return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  }

  const { fecha, tipo, duracionMinutos, notas } = req.body;

  if (!fecha || !tipo || !duracionMinutos) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  entrenamiento.fecha = fecha;
  entrenamiento.tipo = tipo;
  entrenamiento.duracionMinutos = duracionMinutos;
  entrenamiento.notas = notas ?? '';

  res.json(entrenamiento);
});

app.get('/api/entrenamientos/:id', (req, res) => {
  const id = Number(req.params.id);
  const entrenamiento = entrenamientos.find(t => t.id === id);

  if (!entrenamiento) {
    return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  }

  res.json(entrenamiento);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});