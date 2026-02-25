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

        await channel.assertExchange("order_exchange", "fanout", {
            durable: true,
        });

        await channel.assertExchange("bill_order_status_exchange", "fanout", {
            durable: true,
        });

        await channel.assertExchange("shipping_order_status_exchange", "fanout", {
            durable: true,
        });

        await channel.assertQueue("billing_shipping_order_status_queue", {
            durable: true,
        });

        await channel.bindQueue(
            "billing_shipping_order_status_queue",
            "shipping_order_status_exchange",
            ""
        );

        await channel.assertQueue("order_queue", { durable: true });

        await channel.bindQueue(
            "order_queue",
            "order_exchange",
            ""
        );

        console.log("Billing Consumer Started...");

        channel.consume(
            "order_queue",
            async (msg: any) => {
                if (!msg) return;

                console.log('consumer working')

                try {
                    const content = msg.content.toString();
                    const data = JSON.parse(content);

                    console.log("Received message from order queue:", data);

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
                                orderId: data.message.orderId,
                                eventType:'order.billed',
                                status: 'success'
                            }
                            channel.publish(
                                "bill_order_status_exchange",
                                "",
                                Buffer.from(JSON.stringify(payload)),
                                { persistent: true }
                            );

                        } else {
                            const payload = {
                                orderId: data.message.orderId,
                                eventType:'order.billed',
                                status: 'failed'
                            }
                            channel.publish(
                                "bill_order_status_exchange",
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

        channel.consume(
            "billing_shipping_order_status_queue",
            async (msg: any) => {
                if (!msg) return;

                const content = msg.content.toString();
                const data = JSON.parse(content);
                console.log('shipping data is ', data)

                if (data.status == 'success') {
                    return channel.ack(msg);

                }else{
                    console.log('comming in these',data.status)

                    const refundStatus = await this.billingService.handleOrderRefund(data.orderId)
                    console.log("refund status is ",refundStatus)
                }
                channel.ack(msg);

            }, { noAck: false })
    }
}
