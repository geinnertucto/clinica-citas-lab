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

**Pistas por capacidad**

| Capacidad       | Dónde mirar                                             | Preguntas que ayudan                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SAST**        | `src/server.js` y `src/db.js`                           | ¿La app arma una consulta a la base de datos pegando lo que escribe el usuario? ¿Cómo se guardan las claves de los pacientes? Cuando alguien pide una receta, ¿podría pedir cualquier otro archivo?          |
| **Secretos**    | Todos los archivos, también los que empiezan con punto, y el historial | Busquen palabras como `clave`, `key`, `token`, `secret` o `password`. ¿Qué archivos de configuración se subieron? Un secreto borrado, ¿desaparece del historial?                         |
| **SCA**         | `package.json` y `package-lock.json`                    | ¿Qué versión de cada librería usa la app? Búsquenla en [osv.dev](https://osv.dev): ¿tiene fallas conocidas? El equipo pidió 4 librerías: ¿cuántas hay en total en `package-lock.json`, y quién trajo las demás? |
| **Contenedores**| `Dockerfile`                                            | La primera línea dice qué imagen base se usa: ¿esa versión de Node.js todavía recibe parches? ¿Con qué usuario corre la app? ¿Hay algo que no debería estar escrito ahí? ¿Qué mete `COPY . .` en la imagen? |

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

Pista: miren la dirección de la página de la cita.

## 6 · El dictamen

Cada equipo cierra con una frase para el gerente: **¿aprueban el release 1.0? ¿Qué tiene que corregir la fábrica antes
de salir a producción?**
