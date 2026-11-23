// Cobro de la cita con la Pasarela Andina (pasarela ficticia: aquí no se cobra nada).

// La clave ya no está en el código: ahora viene del archivo .env.
const CLAVE_PASARELA = process.env.PASARELA_KEY || '';

function cobrarCita(cita, monto) {
  // En la vida real aquí se llamaría a la API de la pasarela con la clave.
  return {
    cita: cita.id,
    monto,
    estado: 'pagado',
    pasarela: 'Pasarela Andina',
    clave: CLAVE_PASARELA.slice(0, 8) + '…',
  };
}

module.exports = { cobrarCita };
