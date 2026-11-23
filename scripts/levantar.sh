#!/usr/bin/env bash
# Construye la imagen de la app y la corre en el puerto 3000.
set -euo pipefail
cd "$(dirname "$0")/.."

docker build -t clinica-citas .
docker rm -f clinica >/dev/null 2>&1 || true
docker run -d --name clinica -p 3000:3000 clinica-citas >/dev/null
echo "La app corre en el contenedor «clinica», puerto 3000."

if [ -n "${CODESPACE_NAME:-}" ]; then
  URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  if gh codespace ports visibility 3000:public -c "$CODESPACE_NAME" >/dev/null 2>&1; then
    echo "Puerto público. Comparte esta dirección con la sala: $URL"
  else
    echo "Para que la sala la abra, en la pestaña «Puertos»: clic derecho en 3000 → Visibilidad del puerto → Pública."
    echo "Luego comparte: $URL"
  fi
else
  echo "Abre http://localhost:3000"
fi
