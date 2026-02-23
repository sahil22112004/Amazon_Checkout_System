import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RabbitMQConnection } from "../rabbitmq.connection";
import { BillingInbox } from "../../inbox/billing-inbox.entity";
import { BillingService } from "./billing.service";

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
    constructor(
        @InjectRepository(BillingInbox)
        private billingInboxRepo: Repository<BillingInbox>,
        private rabbitConnection: RabbitMQConnection,
        private billingService: BillingService
    ) { }

    async onModuleInit() {
        const channel = await this.rabbitConnection.getChannel();

        // await channel.assertExchange("orders_exchange", "direct", {
        //   durable: true,
        // });

        await channel.assertExchange("notification_exchange", "fanout", {
            durable: true,
        });

        await channel.assertExchange("order_status", "fanout", {
            durable: true,
        });

        // await channel.assertQueue("billing_queue", {
        //   durable: true,
        // });

        // await channel.bindQueue(
        //   "billing_queue",
        //   "orders_exchange",
        //   "order.placed"
        // );

        await channel.assertQueue("notification_queue", { durable: true });

        await channel.bindQueue(
            "notification_queue",
            "notification_exchange",
            ""
        );

        console.log("Billing Consumer Started...");

        channel.consume(
            "notification_queue",
            async (msg: any) => {
                if (!msg) return;

                console.log('consumer working', msg)

                try {
                    const content = msg.content.toString();
                    const data = JSON.parse(content);

                    console.log("Received message:", data);

                    const existing = await this.billingInboxRepo.findOne({
                        where: { eventId: data.messageId },
                    });

                    if (!existing) {
                        const inboxEntry = this.billingInboxRepo.create({
                            eventId: data.messageId,
                            eventType: data.eventType,
                        });

                        await this.billingInboxRepo.save(inboxEntry);

                        const payment_status = await this.billingService.handleOrderPlaced(data.message);
                        if (payment_status.message == 'payment_successfully') {
                            const payload = {
                                status: 'success'
                            }
                            channel.publish(
                                "order_status",
                                "",
                                Buffer.from(JSON.stringify(payload)),
                                { persistent: true }
                            );

                        } else {
                            const payload = {
                                status: 'failed'
                            }
                            channel.publish(
                                "order_status",
                                "",
                                Buffer.from(JSON.stringify(payload)),
                                { persistent: true }
                            );

                        }
                    } else {
                        console.log("Duplicate event skipped:", data.messageId);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing message:", error);

                    channel.nack(msg, false, true);
                }
            },
            { noAck: false }
        );
    }
}