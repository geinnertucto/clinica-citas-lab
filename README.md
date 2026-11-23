# Clínica Andina · laboratorio de seguridad en la construcción de software

> [!WARNING]
> **Repositorio con fines didácticos.** Esta app tiene **vulnerabilidades y malas prácticas sembradas a propósito**
> para una clase de seguridad en el desarrollo de software.
>
> - No la despliegues en un servidor real ni copies su código a un proyecto.
> - Las personas, las citas, las claves y los tokens son **ficticios**. La «Pasarela Andina» no existe y aquí no se
>   cobra nada.
> - Las fallas son intencionales: no hace falta reportarlas.

## El caso

La red de clínicas **Clínica Andina** (ficticia) quiere que sus pacientes vean y paguen sus citas desde el celular. La
app la construye una fábrica de software externa. Antes de aprobar la primera versión, el equipo de seguridad de la
clínica revisa el repositorio.

La app maneja **datos de salud**: quién tiene cita, con qué especialidad y por qué motivo.

## Qué hay en el repositorio

| Carpeta o archivo                                                    | Qué es                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`src/`](src/)                                                       | El código de la app: inicio de sesión, citas, recetas y pagos.     |
| [`public/`](public/)                                                 | Las pantallas que ve el paciente.                                  |
| [`package.json`](package.json) y [`package-lock.json`](package-lock.json) | Las librerías de terceros que usa la app.                     |
| [`Dockerfile`](Dockerfile)                                           | Cómo se arma la imagen del contenedor.                             |
| [`.github/workflows/seguridad.yml`](.github/workflows/seguridad.yml) | El pipeline de seguridad que corre en cada pull request.           |
| [`ACTIVIDAD.md`](ACTIVIDAD.md)                                       | **La actividad de la clase**: qué buscar y cómo armar el informe.  |

## La actividad

Está en **[ACTIVIDAD.md](ACTIVIDAD.md)**. En resumen:

1. Los equipos revisan el repositorio desde el navegador, sin instalar nada, y anotan cada mala práctica que
   encuentran, con su evidencia.
2. El docente abre un pull request y el pipeline corre los escáneres.
3. Cada equipo compara lo que encontró con lo que encontraron los escáneres.

## El pipeline de seguridad

Cada pull request pasa por estas etapas, en GitHub Actions:

| Etapa                    | Herramienta                                      | Qué revisa                                                    | Regla de corte: se detiene si hay… |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------- |
| 0 · Build                | npm                                              | Que la app se instale y arranque.                             | un error al arrancar               |
| 1 · SAST                 | [Semgrep](https://semgrep.dev/)                  | El código, sin ejecutarlo.                                    | hallazgos `ERROR`                  |
| 2 · Secretos             | [Gitleaks](https://github.com/gitleaks/gitleaks) | Los archivos y **todo el historial de Git**.                  | cualquier secreto                  |
| 3 · SCA                  | [Trivy](https://trivy.dev/)                      | Las librerías de terceros, también las indirectas, y el SBOM. | fallas `CRITICAL` o `HIGH`         |
| 4 · Contenedor           | [Trivy](https://trivy.dev/)                      | La imagen construida y el Dockerfile.                         | fallas `CRITICAL`; en el Dockerfile, también `HIGH` |
| 5 · Deploy (simulado)    | —                                                | Solo corre si todos los controles pasan.                      | —                                  |

Cuando un control encuentra algo sobre su regla de corte, su etapa queda en rojo y el deploy no corre: eso es el
**build break**. Los resultados se ven en tres lugares, todos públicos:

- en la pestaña **Checks** del pull request, con una X roja en la etapa que se detuvo;
- en un **comentario del pipeline** en el pull request, con una tabla por control;
- en el **resumen de cada ejecución**, en la pestaña [Actions](../../actions).

## Cómo ejecutarlo

### Opción 1 · En un Codespace (recomendada, no instala nada en tu equipo)

1. En GitHub: **Code → Codespaces → Create codespace on main**. Hace falta una cuenta de GitHub.
2. Cuando abra la terminal, levanta la app en su contenedor:

   ```bash
   ./scripts/levantar.sh
   ```

3. Abre la pestaña **Puertos** y entra al puerto `3000`. Para que otras personas la abran desde su celular, cambia la
   visibilidad del puerto a **Pública** (clic derecho → Visibilidad del puerto). El script intenta hacerlo solo.
4. Ingresa con uno de los pacientes ficticios:

   | Usuario | Clave       |
   | ------- | ----------- |
   | `ana`   | `ana2026`   |
   | `bruno` | `bruno2026` |
   | `carla` | `carla2026` |

5. Al terminar, detén el Codespace (**Codespaces → Stop**) para no gastar horas de tu cuota.

### Opción 2 · En tu equipo, con Docker

```bash
git clone https://github.com/geinnertucto/clinica-citas-lab.git
cd clinica-citas-lab
./scripts/levantar.sh   # o: docker build -t clinica-citas . && docker run --rm -p 3000:3000 clinica-citas
```

Abre <http://localhost:3000>.

### Opción 3 · En tu equipo, con Node.js 22

```bash
npm ci
npm start
```

## Cómo lanzar el pipeline (docente)

El pipeline corre con cada pull request. Para la clase basta un cambio pequeño desde tu IDE:

```bash
git checkout -b clase/revision-de-seguridad
echo "" >> public/estilos.css          # cualquier cambio sirve
git commit -am "Revisión de seguridad antes del release 1.0"
git push -u origin clase/revision-de-seguridad
gh pr create --fill                     # o ábrelo desde la web de GitHub
```

Luego, en el pull request:

1. **Checks:** las etapas se encienden una a una; las que se detienen quedan en rojo.
2. **El botón de merge** queda bloqueado, porque `main` exige que los controles pasen.
3. **El comentario del pipeline** muestra la tabla de cada control, con enlaces al archivo y la línea.

Después de la clase, cierra el pull request sin fusionarlo, para que el repositorio quede listo para la próxima.

## Herramientas y versiones

Semgrep 1.183.0, Gitleaks 8.30.1 y Trivy 0.76.2, cada una en su imagen oficial de Docker. Las reglas propias del
proyecto están en [`.semgrep.yml`](.semgrep.yml) y [`.gitleaks.toml`](.gitleaks.toml).
