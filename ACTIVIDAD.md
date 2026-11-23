# Actividad · ¿Aprobarías este release?

La fábrica entregó la primera versión de la app de citas de Clínica Andina. Ustedes son el equipo de seguridad de la
clínica: **antes de que la app salga a producción, revisen el repositorio y encuentren todas las malas prácticas que
puedan.**

En el repositorio hay **al menos 10**, repartidas en cuatro capacidades: SAST, secretos, SCA y contenedores. No hace
falta saber programar: basta leer con atención, abrir los archivos y mirar el historial.

## 1 · Exploren el repositorio (25 minutos)

Todo se hace desde el navegador, sin instalar nada y sin cuenta de GitHub.

**Cómo moverse en GitHub**

- **Abrir un archivo:** clic en su nombre. Las carpetas se abren igual.
- **Ver el historial:** en la página principal, clic en **Commits** (arriba de la lista de archivos). Cada commit es un
  cambio; al abrirlo, lo **rojo** es lo que se quitó y lo **verde**, lo que se agregó.
- **Guardar la evidencia:** clic en el número de una línea. La dirección del navegador termina en `#L12`: esa dirección
  lleva justo a esa línea. Cópienla en el informe.

**Qué busca cada capacidad**

| Capacidad        | Busca…                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **SAST**         | Errores en el código que escribió el equipo y que un atacante puede aprovechar.                             |
| **Secretos**     | Claves, contraseñas o tokens que quedaron escritos donde cualquiera con acceso al repositorio los puede leer. |
| **SCA**          | Librerías de terceros con fallas ya conocidas y publicadas (CVE).                                           |
| **Contenedores** | Lo que trae la imagen sobre la que corre la app y cómo se arma y se ejecuta el contenedor.                  |

**Mapa del repositorio:** qué es cada archivo. No todos tienen problemas; decidan ustedes dónde mirar.

| Archivo o carpeta                   | Qué es                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server.js`                     | El corazón de la app: recibe cada pedido del celular (iniciar sesión, ver una cita, descargar una receta, pagar) y decide qué responder. |
| `src/db.js`                         | Crea la base de datos y carga los pacientes y sus citas.                                                                                |
| `src/pagos.js`                      | Conecta la app con la pasarela de pagos.                                                                                                |
| `public/`                           | Las pantallas que ve el paciente.                                                                                                       |
| `recetas/`                          | Las recetas que el paciente puede descargar.                                                                                            |
| `package.json`                      | La lista de librerías de terceros que el equipo decidió usar, con su versión.                                                           |
| `package-lock.json`                 | La lista completa de lo que se instala: las librerías que pidió el equipo y las que esas librerías traen a su vez.                      |
| `Dockerfile`                        | La receta del contenedor que va a producción: sobre qué imagen base se construye, qué se copia adentro, con qué usuario corre y cómo arranca. |
| `.env`                              | Valores de configuración que la app lee al arrancar.                                                                                    |
| `.gitignore`                        | La lista de archivos que Git no debe subir al repositorio.                                                                              |
| `.github/workflows/`                | El pipeline de CI/CD: los controles que corren en cada pull request. Lo verán en la parte 3.                                            |
| `.devcontainer/` y `scripts/`       | El entorno de trabajo del desarrollador en GitHub Codespaces y un atajo para levantar la app. No van a producción.                      |
| Historial (**Commits**)             | Cada cambio que se hizo al repositorio, con fecha y autor. Todo lo que alguna vez se subió queda registrado ahí.                         |

**Para verificar lo que encuentren:** [osv.dev](https://osv.dev) dice si una versión de una librería tiene fallas
conocidas, y [endoflife.date](https://endoflife.date) dice hasta cuándo una versión de un software recibe parches.

## 2 · Armen el informe

Copien esta tabla en un documento compartido del equipo, como Google Docs, Word o una hoja de cálculo. Una fila por
hallazgo:

| #   | Capacidad | Qué encontramos | Evidencia (enlace a la línea o al commit) | Por qué es un riesgo para la clínica | Severidad (alta, media o baja) | ¿Bloquea el release? |
| --- | --------- | --------------- | ----------------------------------------- | ------------------------------------ | ------------------------------ | -------------------- |
| 1   |           |                 |                                           |                                      |                                |                      |

Escriban «por qué es un riesgo» en palabras simples, como se lo explicarían al gerente de la clínica.

## 3 · El pipeline (lo muestra el docente)

El docente abre un pull request y el pipeline corre los escáneres: Semgrep (SAST), Gitleaks (secretos) y Trivy (SCA y
contenedores). Miren tres cosas:

1. **Dónde corre cada control** y en qué orden.
2. **Cómo se ve un informe:** qué dice la severidad, el archivo y la línea, y la regla o la falla conocida (CVE).
3. **Dónde se ve el build break:** la X roja, el deploy que no corre y el botón de merge bloqueado.

## 4 · Comparen

Agreguen al informe una tabla de contraste:

| Hallazgo | Lo encontramos | Lo encontró el escáner | Comentario |
| -------- | -------------- | ---------------------- | ---------- |
|          | Sí / No        | Sí / No                |            |

Para conversar en la sala:

- ¿Qué encontraron ustedes que el escáner no vio?
- ¿Qué vio el escáner que a ustedes se les pasó?
- ¿Algún hallazgo del escáner les parece exagerado? ¿Debería detener el release?

## 5 · Lo que ningún escáner ve

El docente levanta la app y comparte la dirección. Ingresen desde el celular con `ana` y la clave `ana2026` y abran
una de sus citas. Hay un riesgo más, y **no lo detecta ninguno de los escáneres del pipeline**. ¿Lo encuentran?

## 6 · El dictamen

Cada equipo cierra con una frase para el gerente: **¿aprueban el release 1.0? ¿Qué tiene que corregir la fábrica antes
de salir a producción?**
