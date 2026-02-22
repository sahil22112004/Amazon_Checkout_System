import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RabbitMQConnection } from "./rabbitmq.connection";
import { SalesOutbox, OutboxStatus } from "../outbox/sales-outbox.entity";

@Injectable()
export class SalesPublisher {

  constructor(
    @InjectRepository(SalesOutbox)
    private outboxRepo: Repository<SalesOutbox>,
    private rabbitConnection: RabbitMQConnection
  ) {}

  @Cron("*/5 * * * * *")
  async publishPendingMessages() {

    const channel = await this.rabbitConnection.getChannel();

    await channel.assertExchange("orders_exchange", "topic", {
      durable: true,
    });

    const pendingMessages = await this.outboxRepo.find({
      where: { status: OutboxStatus.PENDING },
    });

    for (const msg of pendingMessages) {

      channel.publish(
        "orders_exchange",
        msg.eventType,
        Buffer.from(JSON.stringify(msg.payload)),
        { persistent: true }
      );

      msg.status = OutboxStatus.PUBLISHED;
      await this.outboxRepo.save(msg);
    }
  }
}