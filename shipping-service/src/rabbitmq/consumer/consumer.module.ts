import { Module } from "@nestjs/common";
import { RabbitMQConnection } from "../rabbitmq.connection";
import { RabbitMQConsumer } from "./shipping.consume"
import { TypeOrmModule } from "@nestjs/typeorm";
import { consumeCommand } from "../cli/consumer.command";
import { config } from "dotenv";
import { ShippingInbox } from "../../inbox/shipping-inbox.entity";

config()

@Module({
  imports: [
      TypeOrmModule.forFeature([ShippingInbox]),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [ShippingInbox],
      synchronize: false,
    }),
  ],
  providers: [RabbitMQConnection, RabbitMQConsumer,consumeCommand],
})
export class ConsumerModule {}