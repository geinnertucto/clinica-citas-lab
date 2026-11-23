// Convierte el JSON de cada escáner en una tabla Markdown legible y aplica la regla de corte.
// Uso: node informe.js <tipo> <archivo.json> <salida.md>
// Tipos: sast, secretos, sca, imagen, dockerfile
const fs = require('fs');

const [tipo, entrada, salida] = process.argv.slice(2);
const datos = JSON.parse(fs.readFileSync(entrada, 'utf8') || 'null');
const repo = process.env.GITHUB_REPOSITORY;
const sha = process.env.COMMIT_SHA || process.env.GITHUB_SHA;

const ORDEN = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN', 'ERROR', 'WARNING', 'INFO'];
const ICONO = { SECRETO: '🟥', CRITICAL: '🟥', HIGH: '🟧', ERROR: '🟥', WARNING: '🟧', MEDIUM: '🟨', LOW: '⬜', INFO: '⬜', UNKNOWN: '⬜' };
const etiqueta = (s) => `${ICONO[s] || ''} ${s}`;
const enlace = (archivo, linea, commit = sha) =>
  `[\`${archivo}:${linea}\`](https://github.com/${repo}/blob/${commit}/${archivo}#L${linea})`;
const corto = (texto, max = 140) => {
  const limpio = String(texto || '').replace(/\s+/g, ' ').replace(/\|/g, '/').trim();
  return limpio.length > max ? limpio.slice(0, max - 1) + '…' : limpio;
};
const porSeveridad = (a, b) => ORDEN.indexOf(a.severidad) - ORDEN.indexOf(b.severidad);

let titulo;
let corte; // severidades que detienen el pipeline
let filas = []; // { severidad, columnas: [] }
let encabezado;
let notas = [];

if (tipo === 'sast') {
  titulo = '1 · SAST · Semgrep revisa el código sin ejecutarlo';
  corte = ['ERROR'];
  encabezado = ['Severidad', 'Qué encontró', 'Dónde', 'Regla'];
  filas = (datos.results || []).map((r) => ({
    severidad: r.extra.severity,
    columnas: [corto(r.extra.message), enlace(r.path, r.start.line), `\`${r.check_id.split('.').pop()}\``],
  }));
} else if (tipo === 'secretos') {
  titulo = '2 · Secretos · Gitleaks revisa los archivos y todo el historial de Git';
  corte = ['SECRETO'];
  encabezado = ['Severidad', 'Qué encontró', 'Dónde', 'Commit'];
  filas = (datos || []).map((s) => ({
    severidad: 'SECRETO',
    columnas: [
      corto(s.Description),
      enlace(s.File, s.StartLine, s.Commit),
      `[\`${s.Commit.slice(0, 7)}\`](https://github.com/${repo}/commit/${s.Commit}) · ${corto(String(s.Message).split('\n')[0], 60)}`,
    ],
  }));
  notas.push('El valor de cada secreto se oculta en este informe (`--redact`).');
} else if (tipo === 'sca') {
  titulo = '3 · SCA · Trivy revisa las librerías de terceros';
  corte = ['CRITICAL', 'HIGH'];
  encabezado = ['Severidad', 'Librería', '¿Quién la trajo?', 'Falla conocida', 'Se corrige en'];
  const resultados = datos.Results || [];
  const paquetes = resultados.flatMap((r) => r.Packages || []);
  const relacion = Object.fromEntries(paquetes.map((p) => [`${p.Name}@${p.Version}`, p.Relationship]));
  const directas = paquetes.filter((p) => p.Relationship === 'direct').length;
  notas.push(
    `El SBOM lista **${paquetes.length} librerías**: ${directas} las pidió el equipo y ${paquetes.length - directas} llegaron solas, como dependencias de otras (transitivas).`,
  );
  filas = resultados
    .flatMap((r) => r.Vulnerabilities || [])
    .map((v) => ({
      severidad: v.Severity,
      columnas: [
        `\`${v.PkgName}@${v.InstalledVersion}\``,
        relacion[`${v.PkgName}@${v.InstalledVersion}`] === 'direct' ? 'El equipo (directa)' : 'Otra librería (transitiva)',
        `[${v.VulnerabilityID}](${v.PrimaryURL || 'https://nvd.nist.gov/vuln/detail/' + v.VulnerabilityID}) · ${corto(v.Title, 80)}`,
        `\`${corto(v.FixedVersion, 40)}\``,
      ],
    }));
} else if (tipo === 'imagen') {
  titulo = '4a · Contenedor · Trivy revisa la imagen ya construida';
  corte = ['CRITICAL'];
  encabezado = ['Severidad', 'Paquete', 'Falla conocida', 'Se corrige en'];
  const resultados = datos.Results || [];
  const vulns = resultados.flatMap((r) => r.Vulnerabilities || []);
  const conteo = Object.fromEntries(ORDEN.slice(0, 5).map((s) => [s, vulns.filter((v) => v.Severity === s).length]));
  const os = datos.Metadata && datos.Metadata.OS;
  notas.push(
    `Imagen base: **${os ? `${os.Family} ${os.Name}` : 'desconocida'}**${os && os.EOSL ? ' · ⚠️ ya no recibe parches de seguridad (fin de soporte)' : ''}.`,
    `Fallas conocidas en la imagen: **${vulns.length}** · ${ORDEN.slice(0, 5).map((s) => `${etiqueta(s)} ${conteo[s]}`).join(' · ')}.`,
    'La tabla muestra solo las críticas, hasta 15.',
  );
  filas = vulns
    .filter((v) => v.Severity === 'CRITICAL')
    .slice(0, 15)
    .map((v) => ({
      severidad: v.Severity,
      columnas: [
        `\`${v.PkgName}@${corto(v.InstalledVersion, 30)}\``,
        `[${v.VulnerabilityID}](${v.PrimaryURL || 'https://nvd.nist.gov/vuln/detail/' + v.VulnerabilityID}) · ${corto(v.Title, 70)}`,
        `\`${corto(v.FixedVersion, 30) || 'sin corrección'}\``,
      ],
    }));
  const secretos = resultados.flatMap((r) => (r.Secrets || []).map((s) => ({ ...s, Target: r.Target })));
  for (const s of secretos) {
    filas.unshift({
      severidad: s.Severity,
      columnas: [`\`${s.Target}\``, `Secreto dentro de la imagen · ${corto(s.Title, 60)}`, 'sacarlo de la imagen'],
    });
  }
  // Para cortar cuentan todas las críticas, no solo las que entran en la tabla.
  filas.totalCorte = conteo.CRITICAL + secretos.filter((s) => s.Severity === 'CRITICAL').length;
} else if (tipo === 'dockerfile') {
  titulo = '4b · Contenedor · Trivy revisa el Dockerfile';
  corte = ['CRITICAL', 'HIGH'];
  encabezado = ['Severidad', 'Qué encontró', 'Dónde', 'Regla'];
  filas = (datos.Results || [])
    .flatMap((r) => (r.Misconfigurations || []).map((m) => ({ ...m, Target: r.Target })))
    .map((m) => ({
      severidad: m.Severity,
      columnas: [
        `**${corto(m.Title, 70)}** · ${corto(m.Message, 90)}`,
        enlace(m.Target, (m.CauseMetadata && m.CauseMetadata.StartLine) || 1),
        `\`${m.ID}\``,
      ],
    }));
} else {
  console.error(`Tipo desconocido: ${tipo}`);
  process.exit(2);
}

const totalCorte = filas.totalCorte ?? filas.filter((f) => corte.includes(f.severidad)).length;
filas.sort(porSeveridad);
const bloquea = totalCorte > 0;

const md = [
  `### ${titulo}`,
  '',
  ...notas.map((n) => `- ${n}`),
  `- Regla de corte: detiene el pipeline si hay hallazgos **${corte.join(' o ')}**.`,
  `- Resultado: ${filas.length} hallazgos en la tabla · ${bloquea ? `❌ **detiene el pipeline** (${totalCorte} sobre el corte)` : '✅ no detiene el pipeline'}.`,
  '',
];
if (filas.length) {
  md.push(`| ${encabezado.join(' | ')} |`, `| ${encabezado.map(() => '---').join(' | ')} |`);
  for (const f of filas) md.push(`| ${etiqueta(f.severidad)} | ${f.columnas.join(' | ')} |`);
} else {
  md.push('Sin hallazgos.');
}
md.push('');

fs.writeFileSync(salida, md.join('\n'));
fs.appendFileSync(salida + '.estado', `${titulo}\t${filas.length}\t${bloquea ? 'detiene' : 'pasa'}\n`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `bloquea=${bloquea}\n`);
console.log(md.join('\n'));
