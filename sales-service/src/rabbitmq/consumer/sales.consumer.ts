import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RabbitMQConnection } from "../rabbitmq.connection";
import { Order } from "../../orders/entities/order.entity";

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
    constructor(
        private rabbitConnection: RabbitMQConnection,
        @InjectRepository(Order) private orderRepository: Repository<Order>,
    ) { }

    async onModuleInit() {
        const channel = await this.rabbitConnection.getChannel();


        await channel.assertExchange("bill_order_status_exchange", "fanout", {
            durable: true,
        });

        await channel.assertExchange("shipping_order_status_exchange", "fanout", {
            durable: true,
        });

        await channel.assertQueue("bill_order_status_queue", {
            durable: true,
        });

        await channel.assertQueue("shipping_order_status_queue", {
            durable: true,
        });

        await channel.bindQueue(
            "bill_order_status_queue",
            "bill_order_status_exchange",
            ""
        );

        await channel.bindQueue(
            "shipping_order_status_queue",
            "shipping_order_status_exchange",
            ""
        );
        console.log("sales Consumer Started...");

        channel.consume(
            "bill_order_status_queue",
            async (msg: any) => {
                if (!msg) return;
                const content = msg.content.toString();
                const data = JSON.parse(content);
                if (data.status == 'success') {
                    const order = await this.orderRepository.findOne({ where: { orderId: data.orderId } })
                    if (order !== null) {
                        order.status = "BILLED"
                        await this.orderRepository.save(order)
                    } else {
                        console.log('order not found')
                    }

                } else {
                    const order = await this.orderRepository.findOne({ where: { orderId: data.orderId } })
                    if (order !== null) {
                        order.status = "PAYMENT_FAILED"
                        await this.orderRepository.save(order)
                    } else {
                        console.log('order not found')
                    }

                }
                channel.ack(msg);
            },
            { noAck: false }
        );

        channel.consume(
            "shipping_order_status_queue",
            async (msg: any) => {
                if (!msg) return;

                console.log('shipping consumer working', msg)
                const content = msg.content.toString();
                const data = JSON.parse(content);
                console.log('shipping data is ', data)

                if (data.status == 'success') {
                    const order = await this.orderRepository.findOne({ where: { orderId: data.orderId } })
                    if (order !== null) {
                        order.status = "READY_TO_SHIP"
                        await this.orderRepository.save(order)
                    } else {
                        console.log('order not found')
                    }

                }else{
                    console.log('comming in these',data.status)
                    const order = await this.orderRepository.findOne({ where: { orderId: data.orderId } })
                    console.log("order is ",order)
                    if (order !== null) {
                        order.status = "CANCELED"
                        await this.orderRepository.save(order)
                    } else {
                        console.log('order not found')
                    }
                }
                channel.ack(msg);

            }, { noAck: false })
    }
}