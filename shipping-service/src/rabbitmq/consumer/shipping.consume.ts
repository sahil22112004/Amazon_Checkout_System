// import { Injectable, OnModuleInit } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { RabbitMQConnection } from "../rabbitmq.connection";
// import { ShippingInbox } from "../../inbox/shipping-inbox.entity";

// @Injectable()
// export class RabbitMQConsumer implements OnModuleInit {
//     constructor(
//         @InjectRepository(ShippingInbox) private ShippingInboxRepo: Repository<ShippingInbox>,
//         private rabbitConnection: RabbitMQConnection,

//     ) { }

//     async onModuleInit() {
//         const channel = await this.rabbitConnection.getChannel();

//         await channel.assertExchange("order_exchange", "fanout", {
//             durable: true,
//         });

//         await channel.assertExchange("bill_order_status_exchange", "fanout", {
//             durable: true,
//         });

//         await channel.assertExchange("shipping_order_status_Exchange", "fanout", {
//             durable: true,
//         });

//         await channel.assertQueue("billing_order_status_queue", { durable: true });

//         await channel.assertQueue("sales_order_status_queue", { durable: true });

//         await channel.bindQueue(
//             "billing_order_status_queue",
//             "bill_order_status_exchange",
//             ""
//         );

//         await channel.bindQueue(
//             "sales_order_status_queue",
//             "order_exchange",
//             ""
//         );

//         console.log("shipping Consumer Started...");

//         channel.consume(
//             "billing_order_status_queue",
//             async (msg: any) => {
//                 if (!msg) return;

//                 const content = msg.content.toString();
//                 const data = JSON.parse(content);
//                 console.log('consumer working 112', data)
//                 console.log('status is ', data.status)

//                 if (data.status == "success") {
//                     const isExisting = await this.ShippingInboxRepo.findOne({ where: { eventId: data.orderId } })
//                     console.log('existed is ', isExisting)
//                     if (!isExisting) {
//                         console.log('comming in not existed')
//                         const inboxPayload = {
//                             eventId: data.orderId,
//                             eventType: data.eventType
//                         }
//                         const inbox = this.ShippingInboxRepo.create(inboxPayload)
//                         await this.ShippingInboxRepo.save(inbox)
//                         const payload = {
//                             orderId: data.orderId,
//                             eventType: 'order.shipped',
//                             status: 'success'
//                         }
//                         console.log('payload is ', payload)
//                         channel.publish(
//                             "shipping_order_status_Exchange",
//                             "",
//                             Buffer.from(JSON.stringify(payload)),
//                             { persistent: true }
//                         );

//                     } else {
//                         console.log('dublicate skipped')
//                     }

//                 }else{
//                     console.log('billed failed')
//                 }



//                 channel.ack(msg);

//             },
//             { noAck: false }
//         );
//     }
// }



import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RabbitMQConnection } from "../rabbitmq.connection";
import { ShippingInbox } from "../../inbox/shipping-inbox.entity";

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  constructor(
    @InjectRepository(ShippingInbox)
    private shippingInboxRepo: Repository<ShippingInbox>,
    private rabbitConnection: RabbitMQConnection
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitConnection.getChannel();

    await channel.assertExchange("order_exchange", "fanout", { durable: true });
    await channel.assertExchange("bill_order_status_exchange", "fanout", { durable: true });
    await channel.assertExchange("shipping_order_status_exchange", "fanout", { durable: true });

    await channel.assertQueue("shipping_sales_order_status_queue", { durable: true });
    await channel.assertQueue("siping_billing_order_status_queue", { durable: true });

    await channel.bindQueue("shipping_sales_order_status_queue", "order_exchange", "");
    await channel.bindQueue("siping_billing_order_status_queue", "bill_order_status_exchange", "");

    console.log("Shipping Consumer Started...");

    channel.consume("shipping_sales_order_status_queue", async (msg: any) => {
      if (!msg) return;

      const data = JSON.parse(msg.content.toString());

      const event = {
        orderId: data.message.orderId,
        eventType: data.eventType,
        status: "success"
      };

      await this.processEvent(event, channel);

      channel.ack(msg);
    });

    channel.consume("siping_billing_order_status_queue", async (msg: any) => {
      if (!msg) return;

      const data = JSON.parse(msg.content.toString());

      const event = {
        orderId: data.orderId,
        eventType: data.eventType,
        status: data.status
      };

      await this.processEvent(event, channel);

      channel.ack(msg);
    });
  }

  private async processEvent(event: any, channel: any) {
    const { orderId, eventType, status } = event;

    if (status !== "success") {
      console.log("Event failed, skipping:", eventType);
      return;
    }

    const uniqueEventId = `${orderId}_${eventType}`;

    const existing = await this.shippingInboxRepo.findOne({
      where: { eventId: uniqueEventId }
    });

    if (!existing) {
      const inbox = this.shippingInboxRepo.create({
        eventId: uniqueEventId,
        eventType
      });

      await this.shippingInboxRepo.save(inbox);
    }

    const placedEventId = `${orderId}_order.placed`;
    const billedEventId = `${orderId}_order.billed`;
    const shippedEventId = `${orderId}_order.shipped`;

    const placed = await this.shippingInboxRepo.findOne({
      where: { eventId: placedEventId }
    });

    const billed = await this.shippingInboxRepo.findOne({
      where: { eventId: billedEventId }
    });

    const alreadyShipped = await this.shippingInboxRepo.findOne({
      where: { eventId: shippedEventId }
    });

    if (placed && billed && !alreadyShipped) {
      const shippedInbox = this.shippingInboxRepo.create({
        eventId: shippedEventId,
        eventType: "order.shipped"
      });

      await this.shippingInboxRepo.save(shippedInbox);

      const payload = {
        orderId,
        eventType: "order.shipped",
        status: "success"
      };

      channel.publish(
        "shipping_order_status_exchange",
        "",
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );

      console.log("Order shipped successfully:", orderId);
    }
  }
}