# Usa la imagen base de Node.js con la versión deseada (puedes ajustarla según tus necesidades)
FROM node:14-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /dist

# Copia el archivo package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto del código fuente de la aplicación
COPY . .

# Expone el puerto en el que se ejecutará la aplicación (ajústalo si es necesario)
EXPOSE 4005

# Comando para iniciar la aplicación cuando se ejecute el contenedor
CMD ["npm", "start"]
