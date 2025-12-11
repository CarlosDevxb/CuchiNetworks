#!/bin/sh

# Verifica si la variable de entorno API_URL existe
if [ ! -z "$API_URL" ]; then
  echo "🚀 Inyectando configuración de entorno..."
  echo "API_URL detectada: $API_URL"
  
  # Sobrescribe el archivo config.js dentro del servidor Nginx
  echo "window.APP_CONFIG = { API_URL: \"$API_URL\" };" > /usr/share/nginx/html/config.js
else
  echo "⚠️ No se detectó variable API_URL, usando configuración por defecto (localhost)."
fi

# Ejecutar el comando original (iniciar Nginx)
exec "$@"