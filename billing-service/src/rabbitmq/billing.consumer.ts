import { Injectable, OnModuleInit } from "@nestjs/common"
import { RabbitMQConnection } from "./rabbitmq.connection"
import { BillingService } from "../billing/billing.service"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, DataSource } from "typeorm"
import { BillingInbox } from "../billing/inbox/billing-inbox.entity"

@Injectable()
export class BillingConsumer implements OnModuleInit {

  constructor(
    private rabbitConnection: RabbitMQConnection,
    private billingService: BillingService,
    private dataSource: DataSource,

    @InjectRepository(BillingInbox)
    private inboxRepository: Repository<BillingInbox>,
  ) {}

  async onModuleInit() {

    const channel = await this.rabbitConnection.getChannel()

    await channel.assertExchange("orders_exchange", "topic", {
      durable: true,
    })

    const queue = await channel.assertQueue("billing_order_placed_queue", {
      durable: true,
    })

    await channel.bindQueue(
      queue.queue,
      "orders_exchange",
      "order.placed"
    )

    channel.consume(queue.queue, async (msg) => {

      if (!msg) return

      const payload = JSON.parse(msg.content.toString())
      const eventId =
        msg.properties.messageId ||
        payload.orderId

      try {

        await this.dataSource.transaction(async (manager) => {

          const existing = await manager.findOne(BillingInbox, {
            where: { eventId }
          })

          if (existing) {
            return
          }

          await this.billingService.handleOrderPlaced(payload)

          const inbox = manager.create(BillingInbox, {
            eventId,
            eventType: "order.placed",
          })

          await manager.save(inbox)
        })

        channel.ack(msg)

      } catch (error) {

        console.error("Billing error:", error)

        channel.nack(msg, false, false)
      }

    })
  }
}