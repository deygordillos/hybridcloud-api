import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hybrid API',
      version: '1.4.0',
      description: 'Documentación de la API REST con Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor local',
      },
      {
        url: 'https://api-dev.tuhybrid.com',
        description: 'Servidor desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    //'./routes/**/*.js', './routes/**/*.ts'
    path.join(process.cwd(), 'src/routes/**/*.ts'),
    path.join(process.cwd(), 'dist/routes/**/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
