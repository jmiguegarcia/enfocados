const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATOS_DIR = path.join(__dirname, 'datos');
const ARCHIVO_DATOS = path.join(DATOS_DIR, 'entrenamientos.json');

const entrenamientosIniciales = [
  {
    id: 1,
    fecha: '2026-10-05',
    tipo: 'Fuerza',
    duracionMinutos: 45,
    notas: 'Entrenamiento inicial'
  }
];

let entrenamientos = [];
let nextId = 2;

async function guardarEntrenamientos() {
  await fs.mkdir(DATOS_DIR, { recursive: true });
  await fs.writeFile(ARCHIVO_DATOS, JSON.stringify(entrenamientos, null, 2), 'utf-8');
}

async function cargarEntrenamientos() {
  try {
    const contenido = await fs.readFile(ARCHIVO_DATOS, 'utf-8');
    entrenamientos = JSON.parse(contenido);
    console.log(`Datos cargados desde: ${ARCHIVO_DATOS}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      entrenamientos = [...entrenamientosIniciales];
      await guardarEntrenamientos();
      console.log(`Archivo no encontrado. Creado y cargado archivo inicial en: ${ARCHIVO_DATOS}`);
    } else {
      console.error('Error al cargar datos de entrenamientos:', error);
      throw error;
    }
  }

  nextId = entrenamientos.length > 0
    ? Math.max(...entrenamientos.map(t => Number(t.id) || 0)) + 1
    : 1;
}

app.get('/api/entrenamientos', (req, res) => {
  res.json(entrenamientos);
});

app.post('/api/entrenamientos', async (req, res) => {
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
  try {
    await guardarEntrenamientos();
    res.status(201).json(nuevoEntrenamiento);
  } catch (error) {
    console.error('Error al guardar entrenamientos:', error);
    res.status(500).json({ error: 'Error al persistir los datos' });
  }
});

app.delete('/api/entrenamientos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const index = entrenamientos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  }

  entrenamientos.splice(index, 1);
  try {
    await guardarEntrenamientos();
    res.status(204).send();
  } catch (error) {
    console.error('Error al guardar entrenamientos:', error);
    res.status(500).json({ error: 'Error al persistir los datos' });
  }
});

app.put('/api/entrenamientos/:id', async (req, res) => {
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

  try {
    await guardarEntrenamientos();
    res.json(entrenamiento);
  } catch (error) {
    console.error('Error al guardar entrenamientos:', error);
    res.status(500).json({ error: 'Error al persistir los datos' });
  }
});

app.get('/api/entrenamientos/:id', (req, res) => {
  const id = Number(req.params.id);
  const entrenamiento = entrenamientos.find(t => t.id === id);

  if (!entrenamiento) {
    return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  }

  res.json(entrenamiento);
});

async function iniciarServidor() {
  try {
    await cargarEntrenamientos();
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();