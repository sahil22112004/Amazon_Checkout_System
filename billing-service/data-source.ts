import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { config } from "dotenv"


config();

const datasource: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: 'postgres',
  database: process.env.DB_DATABASE,
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  seeds: [],

}

export const AppDataSource = new DataSource(datasource);