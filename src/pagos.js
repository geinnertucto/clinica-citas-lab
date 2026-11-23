// Cobro de la cita con la Pasarela Andina (pasarela ficticia: aquí no se cobra nada).

// TODO: dejé la clave para probar rápido; luego la borro.
const CLAVE_PASARELA = 'pa_live_N2CiSsApCPMRBuYy4RjmNstI2sPaaB3I';

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
