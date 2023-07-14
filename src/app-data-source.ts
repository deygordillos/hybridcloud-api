import { DataSource } from "typeorm"
import 'dotenv/config';

export const appDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    logging: false,
    synchronize: true,
    entities: ['dist/entity/**/*.js'],
    migrations: ['src/migration/**/*.ts'],
    subscribers: ['src/subscriber/**/*.ts']
})