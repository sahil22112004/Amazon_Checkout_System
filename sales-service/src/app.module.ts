import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { config } from "dotenv";
import { OrdersModule } from "./orders/orders.module";
import { RabbitMQConnection } from "./rabbitmq/rabbitmq.connection";
import { SalesPublisher } from "./rabbitmq/sales.publisher";


config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    RabbitMQConnection,SalesPublisher
  ],
})
export class AppModule { }