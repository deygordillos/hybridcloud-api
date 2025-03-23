import { DataSource } from "typeorm"
import config from "./config/config";

export const appDataSource = new DataSource({
    type: config.DB_DRIVER as any,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    logging: config.DB_DEBUG,
    synchronize: config.DB_SYNC,
    entities: [config.isProduction ? 'dist/entity/**/*.js' : 'src/entity/**/*.ts'],
    migrations: [config.isProduction ? 'dist/migration/**/*.js' : 'src/migration/**/*.ts'],
    subscribers: [config.isProduction ? 'dist/subscriber/**/*.js' : 'src/subscriber/**/*.ts']
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