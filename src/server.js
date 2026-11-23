// Citas Clínica Andina · API y web.
// LABORATORIO DIDÁCTICO: este código tiene vulnerabilidades a propósito. No lo copies ni lo despliegues.
require('dotenv').config();
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const { iniciarBase, filas, hashPassword } = require('./db');
const { cobrarCita } = require('./pagos');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

let db;

// Revisa que la persona haya iniciado sesión.
function conSesion(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.paciente = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Inicia sesión' });
  }
}

// Inicio de sesión.
app.post('/api/login', (req, res) => {
  const { usuario, clave } = req.body;
  const consulta =
    "SELECT id, nombre FROM pacientes WHERE usuario = '" + usuario + "' AND clave_md5 = '" + hashPassword(clave || '') + "'";
  const [paciente] = filas(db.exec(consulta));
  if (!paciente) return res.status(401).json({ error: 'Usuario o clave incorrectos' });

  const token = jwt.sign({ id: paciente.id, nombre: paciente.nombre }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, nombre: paciente.nombre });
});

// Mis citas.
app.get('/api/mis-citas', conSesion, (req, res) => {
  const citas = filas(db.exec('SELECT id, especialidad, fecha FROM citas WHERE paciente_id = ?', [req.paciente.id]));
  res.json(citas);
});

// Detalle de una cita.
app.get('/api/citas/:id', conSesion, (req, res) => {
  const [cita] = filas(
    db.exec(
      `SELECT c.id, p.nombre AS paciente, c.especialidad, c.fecha, c.motivo, c.medico
       FROM citas c JOIN pacientes p ON p.id = c.paciente_id WHERE c.id = ?`,
      [req.params.id],
    ),
  );
  if (!cita) return res.status(404).json({ error: 'No existe la cita' });
  res.json(cita);
});

// Pagar una cita.
app.post('/api/citas/:id/pago', conSesion, (req, res) => {
  res.json(cobrarCita({ id: req.params.id }, 80));
});

const PUERTO = process.env.PORT || 3000;
iniciarBase().then((base) => {
  db = base;
  app.listen(PUERTO, () => console.log(`Clínica Andina escuchando en http://localhost:${PUERTO}`));
});
