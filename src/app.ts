import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express"
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from "body-parser";
import indexRoutes from './routes/v1/index.route';
import config from "./config/config";
import { errorHandler } from "./middlewares/error.middleware";
import { globalRateLimiter, authRateLimiter } from "./middlewares/rate-limit.middleware";

// create and setup express app
const app = express()
app.use(helmet({
    // Swagger UI (/api/v1/docs) requiere estilos/scripts inline
    contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan(config.LOGGER));
app.use(express.json())
app.use(function (error: any, _req: Request, res: Response, next: NextFunction) {
    // Catch json error
    if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
        return res.status(400).json({ message: 'Formato de JSON Inválido' });
    }
    next(error);
});
app.use(express.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());

// Rate limiting (deshabilitado en tests)
if (!config.isTest) {
    app.use('/api/v1/auth/login', authRateLimiter);
    app.use('/api/v1/auth/refresh', authRateLimiter);
    app.use('/api', globalRateLimiter);
}

app.use('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'hybrid-auth-service'
  });
});

app.use('/api', indexRoutes);

// Error handler global: debe registrarse después de las rutas
app.use(errorHandler);

export default app;
