import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RabbitMQConnection } from "../rabbitmq.connection";
import { SalesOutbox, OutboxStatus } from "../../outbox/sales-outbox.entity";

@Injectable()
export class SalesPublisher {

  constructor(
    @InjectRepository(SalesOutbox)
    private outboxRepo: Repository<SalesOutbox>,
    private rabbitConnection: RabbitMQConnection
  ) {}

  async publishPendingMessages() {

    const channel = await this.rabbitConnection.getChannel();

    await channel.assertExchange("notification_exchange", "fanout", {
      durable: true,
    });

    const pendingMessages = await this.outboxRepo.find({
      where: { status: OutboxStatus.PENDING },
    });

    for (const msg of pendingMessages) {
      const payload = {
        messageId: msg.id,
        eventType: msg.eventType,
        message: msg.messagePayload,
      };

      channel.publish(
        // "orders_exchange",
        // "order.placed",
        "notification_exchange",
        "",
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );

      msg.status = OutboxStatus.PUBLISHED;
      await this.outboxRepo.save(msg);
    }
  }
}