// Base de datos de la app: SQLite en memoria (sql.js), con datos ficticios.
// Se crea de cero cada vez que arranca la app.
const crypto = require('crypto');
const initSqlJs = require('sql.js');

// Guardamos la clave en MD5, así no queda en texto plano.
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

const PACIENTES = [
  { id: 1, usuario: 'bruno', nombre: 'Bruno Salas', clave: 'bruno2026' },
  { id: 2, usuario: 'ana', nombre: 'Ana Quispe', clave: 'ana2026' },
  { id: 3, usuario: 'carla', nombre: 'Carla Rojas', clave: 'carla2026' },
];

const CITAS = [
  [1, 1, 'Psicología', '2026-12-01 09:00', 'Seguimiento de ansiedad', 'Dra. Paredes'],
  [2, 2, 'Cardiología', '2026-12-02 10:30', 'Control de presión arterial', 'Dr. Medina'],
  [3, 3, 'Dermatología', '2026-12-03 16:00', 'Revisión de lunar', 'Dra. Castro'],
  [4, 1, 'Endocrinología', '2026-12-05 08:00', 'Control de diabetes tipo 2', 'Dr. Ríos'],
  [5, 2, 'Medicina general', '2026-12-09 11:15', 'Chequeo anual', 'Dra. Paredes'],
  [6, 3, 'Ginecología', '2026-12-10 15:30', 'Control prenatal', 'Dra. Vargas'],
];

async function iniciarBase() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`CREATE TABLE pacientes (id INTEGER PRIMARY KEY, usuario TEXT, nombre TEXT, clave_md5 TEXT)`);
  db.run(`CREATE TABLE citas (id INTEGER PRIMARY KEY, paciente_id INTEGER, especialidad TEXT,
          fecha TEXT, motivo TEXT, medico TEXT)`);

  for (const p of PACIENTES) {
    db.run('INSERT INTO pacientes VALUES (?, ?, ?, ?)', [p.id, p.usuario, p.nombre, hashPassword(p.clave)]);
  }
  for (const c of CITAS) {
    db.run('INSERT INTO citas VALUES (?, ?, ?, ?, ?, ?)', c);
  }
  return db;
}

// Convierte el resultado de sql.js en una lista de objetos.
function filas(resultado) {
  if (!resultado.length) return [];
  const { columns, values } = resultado[0];
  return values.map((v) => Object.fromEntries(columns.map((col, i) => [col, v[i]])));
}

module.exports = { iniciarBase, filas, hashPassword };
