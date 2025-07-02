import "reflect-metadata";
import config from "./config/config";
import { appDataSource } from "./app-data-source";
import app from './app'

// Inicializa la conexión de la base de datos
appDataSource.initialize()
.then(() => {
    console.log("Conexión a la base de datos iniciada correctamente!");
    // start express server
    app.listen(config.PORT, () => {
        console.log('Server started on port:', config.PORT);
    });
})
.catch((err) => {
    console.error("Error al inicializar la conexión a la base de datos:", err);
});