
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ... (Etapa 1 de build queda igual) ...

FROM nginx:alpine

# Copiamos los archivos de React
COPY --from=build /app/dist /usr/share/nginx/html

# 👇 ESTO ES LO QUE ARREGLA EL 404 👇
# Copiamos nuestra configuración personalizada sobre la default de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el script de inyección de variables
COPY entrypoint.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]