# Dockerfile para desarrollo con hot reload
FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 5173

# Comando para desarrollo (con hot reload)
# El archivo .env será usado automáticamente por Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
