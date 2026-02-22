import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingModule } from './billing/billing.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: 'postgres',
      database: process.env.DB_DATABASE,
      entities: [],
      synchronize: false,
    }),
    BillingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
