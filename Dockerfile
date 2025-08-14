# --- ETAPA DE CONSTRUCCIÓN (BUILDER STAGE) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copia los archivos de definición de dependencias
COPY package*.json ./

# Instala TODAS las dependencias (incluidas las de desarrollo para la compilación)
# Las advertencias de 'npm warn deprecated' son normales y no son errores críticos para el build.
RUN npm install --include=dev

# Copia todo el código fuente, incluyendo la carpeta 'src' y 'tsconfig.json'
COPY . .

# Comando para compilar la aplicación TypeScript a JavaScript
# Esto ejecutará 'tsc' a través de npm, lo que asegura que 'tsc' se encuentre
# dentro de node_modules/.bin y genere la carpeta 'dist'.
# He quitado la parte '|| echo "ERROR: npm run build failed!"' porque si falla,
# Docker ya detendrá la build con un error.
RUN npm run build

# --- PASOS DE VERIFICACIÓN (NO SON ESTRICTAMENTE DEPURACIÓN, PERO ÚTILES) ---
# Listar el contenido del WORKDIR después del build para VER si 'dist' apareció
RUN ls -la /app/
# Intentar listar el contenido de 'dist' para confirmar que no está vacío
# Si no lo encuentra, el paso fallará, lo cual es lo que queremos si no se genera.
RUN ls -la /app/dist/
# --- FIN DE PASOS DE VERIFICACIÓN ---


# --- ETAPA DE PRODUCCIÓN (PRODUCTION STAGE) ---
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copia el certificado CA
COPY ca.pem /app/ca.pem

# Copia solo la carpeta 'dist' (los archivos JavaScript compilados) desde la etapa 'builder'
COPY --from=builder /app/dist ./dist

EXPOSE 3002

CMD ["npm", "start"]