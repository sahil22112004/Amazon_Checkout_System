import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { RabbitMQConnection } from "../rabbitmq.connection";
import { SalesPublisher } from "./sales.publisher"
import { PublishCommand } from "../cli/publish.command";
import { config } from 'dotenv'
import { SalesOutbox } from "../../outbox/sales-outbox.entity";

config()

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [SalesOutbox],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([SalesOutbox]),
  ],
  providers: [RabbitMQConnection, SalesPublisher, PublishCommand],
})
export class ProducerModule {}