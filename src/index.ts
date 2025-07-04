import "reflect-metadata";
import express from "express"
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from "body-parser";
import indexRoutes from './routes/v1/index.route';
import config from "./config/config";
import { appDataSource } from "./app-data-source";
import { errorHandler } from "./middlewares/error.middleware";

// create and setup express app
const app = express()
app.use(cors());
app.use(morgan(config.LOGGER));
app.use(express.json())
app.use (function (error, req, res, next){
    //Catch json error
    res.status(500).json({ message: 'Formato de JSON Inválido' });
});
app.use(express.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());
app.use(errorHandler);
app.use(indexRoutes);

// Inicializa la conexión de la base de datos
appDataSource
    .initialize()
    .then(() => {
        console.log("Conexión a la base de datos iniciada correctamente!");
    })
    .catch((err) => {
        console.error("Error al inicializar la conexión a la base de datos:", err);
    });

// start express server
app.listen(config.PORT, () => {
    console.log('Server started on port:', config.PORT);
});