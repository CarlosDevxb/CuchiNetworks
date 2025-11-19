# Usamos una versión ligera de Node
FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias (para aprovechar el caché de Docker)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Exponemos el puerto que usa Express
EXPOSE 3000

# Comando para iniciar en modo desarrollo
CMD ["npm", "run", "dev"]
