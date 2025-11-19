FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# IMPORTANTE: Agregamos "-- --host" para que Vite exponga la red fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]
