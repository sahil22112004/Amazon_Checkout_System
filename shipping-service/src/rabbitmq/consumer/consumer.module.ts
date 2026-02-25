import { Module } from "@nestjs/common";
import { RabbitMQConnection } from "../rabbitmq.connection";
import { RabbitMQConsumer } from "./shipping.consume"
import { TypeOrmModule } from "@nestjs/typeorm";
import { consumeCommand } from "../cli/consumer.command";
import { config } from "dotenv";
import { ShippingInbox } from "../../inbox/shipping-inbox.entity";
import { ShippingOrderItem } from "../../shpping/entities/placedOrderItem.entity";
import { ShippingorderService } from "./shippingOrder.service";
import { Products } from "../../shpping/entities/product.entity";

config()

@Module({
  imports: [
      TypeOrmModule.forFeature([ShippingInbox,ShippingOrderItem,Products]),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [ShippingInbox,ShippingOrderItem,Products],
      synchronize: false,
    }),
  ],
  providers: [RabbitMQConnection, RabbitMQConsumer,consumeCommand,ShippingorderService],
})
export class ConsumerModule {}