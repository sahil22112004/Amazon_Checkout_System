import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { config } from "dotenv"
import ProductSeeder from './src/database/seeds/productSeeding';
import { Products } from './src/shpping/entities/product.entity';



config();

const datasource: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Products],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  seeds: [ProductSeeder],

}

export const AppDataSource = new DataSource(datasource);