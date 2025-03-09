# Imagen base con Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
