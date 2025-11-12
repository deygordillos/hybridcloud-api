import "reflect-metadata";
import express from "express"
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from "body-parser";
import indexRoutes from './routes/v1/index.route';
import config from "./config/config";
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

app.use('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'hybrid-auth-service'
  });
});

app.use('/api', indexRoutes);

export default app;