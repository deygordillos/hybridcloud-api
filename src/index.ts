import express from "express"
import cors from 'cors';
import morgan from 'morgan';
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
        app.use(express.urlencoded({
            extended: true,
        }));

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
