import { Module } from "@nestjs/common";
import { RabbitMQConnection } from "../rabbitmq.connection";
import { RabbitMQConsumer } from "./billing.consume"
import { TypeOrmModule } from "@nestjs/typeorm";
import { consumeCommand } from "../cli/consumer.command";
import { BillingInbox } from "../../inbox/billing-inbox.entity";
import { config } from "dotenv";
import { BillingService } from "./billing.service";
import { Payment } from "../../entities/payment.entity";
import { BillingAccount } from "../../entities/billing-account.entity";

config()

@Module({
  imports: [
      TypeOrmModule.forFeature([BillingInbox, BillingAccount,Payment,]),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [BillingInbox, BillingAccount,Payment],
      synchronize: false,
    }),
  ],
  providers: [RabbitMQConnection, RabbitMQConsumer,consumeCommand,BillingService],
})
export class ConsumerModule {}