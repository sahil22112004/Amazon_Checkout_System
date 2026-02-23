import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { config } from "dotenv"
import AccountSeeder from './src/database/seeds/accountSeeding';
import { BillingAccount } from './src/entities/billing-account.entity';
import { Payment } from './src/entities/payment.entity';


config();

const datasource: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: 'postgres',
  database: process.env.DB_DATABASE,
  entities: [BillingAccount,Payment],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  seeds: [AccountSeeder],

}

export const AppDataSource = new DataSource(datasource);