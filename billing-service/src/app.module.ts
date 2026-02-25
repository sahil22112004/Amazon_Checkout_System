import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingAccount } from './entities/billing-account.entity';
import { Payment } from './entities/payment.entity';
import { BillingInbox } from './inbox/billing-inbox.entity';
import { config } from "dotenv";
import { BillingModule } from './billing/billing.module';
import { BillingOrder } from './billing/entities/billingOrder.entity';

config()

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: 'postgres',
      database: process.env.DB_DATABASE,
      entities: [BillingAccount,Payment,BillingOrder],
      synchronize: false,
    }),
    BillingModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
