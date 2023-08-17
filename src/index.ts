import express from "express"
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from "body-parser";
import { appDataSource } from "./app-data-source"
import indexRoutes from './routes/index.route';
import 'dotenv/config';

// establish database connection
appDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")

        // create and setup express app
        const app = express()
        app.use(cors());
        app.use(morgan(process.env.LOGGER || 'dev'));
        app.use(express.json())
        app.use (function (error, req, res, next){
            //Catch json error
            res.status(500).json({ message: 'Formato de JSON Inválido' });
        });
        app.use(express.urlencoded({
            extended: true,
        }));
        app.use(bodyParser.json());

        app.use(indexRoutes);

        // start express server
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log('Server started on port:', port);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })
