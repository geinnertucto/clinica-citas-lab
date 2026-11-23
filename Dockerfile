# Imagen de la app de citas.
# LABORATORIO DIDÁCTICO: este Dockerfile tiene malas prácticas a propósito.
FROM node:16

# Token del registro privado de paquetes de la fábrica (ficticio).
ENV TOKEN_REGISTRO=frb_LLLGWuGdNr8IqHXrpnrtpTI3UdwLaHd0AqCF

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3000
CMD ["npm", "start"]
