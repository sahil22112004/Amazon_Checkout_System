import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RabbitMQConnection } from "../rabbitmq.connection";

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
    constructor(
        private rabbitConnection: RabbitMQConnection,
    ) { }

    async onModuleInit() {
        const channel = await this.rabbitConnection.getChannel();

        await channel.assertExchange("order_status", "fanout", {
            durable: true,
        });

        await channel.assertQueue("order_status_queue", {
            durable: true,
        });

        await channel.bindQueue(
            "order_status_queue",
            "order_status",
            ""
        );
        console.log("sales Consumer Started...");

        channel.consume(
            "order_status",
            async (msg: any) => {
                if (!msg) return;

                console.log('consumer working', msg)
                const content = msg.content.toString();
                const data = JSON.parse(content);
                if (data.status == 'success') {

                }


                channel.ack(msg);
            },
            { noAck: false }
        );
    }
}