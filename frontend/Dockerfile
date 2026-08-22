# Dockerfile frontend React + Vite

FROM node:20-alpine

WORKDIR /app

# Copie des manifests d'abord pour profiter du cache Docker
COPY package.json package-lock.json* ./

# Installation des dépendances
RUN npm install

# Copie du reste du code
COPY . .

EXPOSE 5173

# --host : écoute sur 0.0.0.0 pour que Docker puisse exposer le port
CMD ["npm", "run", "dev"]
