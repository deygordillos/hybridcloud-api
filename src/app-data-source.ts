import { DataSource } from "typeorm"
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const appDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    logging: process.env.DB_DEBUG === 'true' || false,
    synchronize: process.env.DB_SYNC === 'true' || false,
    entities: [isProduction ? 'dist/entity/**/*.js' : 'src/entity/**/*.ts'],
    migrations: [isProduction ? 'dist/migration/**/*.js' : 'src/migration/**/*.ts'],
    subscribers: [isProduction ? 'dist/subscriber/**/*.js' : 'src/subscriber/**/*.ts']
})

export const appDataSourceCompany = (db = '') => { 
    return new DataSource({
        type: "mysql",
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        username: process.env.DB_USERNAME || '',
        password: process.env.DB_PASSWORD || '',
        database: db || '',
        logging: false,
        synchronize: false,
        entities: ['dist/entity/**/*.js'],
        migrations: ['src/migration/companies/*.js'],
        subscribers: ['src/subscriber/**/*.ts']
    })
}