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
import { ShippingService } from "./shippingOrder.service";

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {

  constructor(
    @InjectRepository(ShippingInbox)
    private shippingInboxRepo: Repository<ShippingInbox>,
    private rabbitConnection: RabbitMQConnection,
    private shippingService: ShippingService
  ) {}

  async onModuleInit() {

    const channel = await this.rabbitConnection.getChannel();

    await channel.assertExchange("order_exchange", "fanout", { durable: true });
    await channel.assertExchange("bill_order_status_exchange", "fanout", { durable: true });
    await channel.assertExchange("shipping_order_status_exchange", "fanout", { durable: true });

    await channel.assertQueue("shipping_sales_order_status_queue", { durable: true });
    await channel.assertQueue("shipping_billing_order_status_queue", { durable: true });

    await channel.bindQueue("shipping_sales_order_status_queue", "order_exchange", "");
    await channel.bindQueue("shipping_billing_order_status_queue", "bill_order_status_exchange", "");

    console.log("Shipping Consumer Started...");

    // ORDER PLACED
    channel.consume("shipping_sales_order_status_queue", async (msg: any) => {

      if (!msg) return;

      const data = JSON.parse(msg.content.toString());

      if (data.eventType === "order.placed") {

        const eventId = `${data.message.orderId}_order.placed`;

        const existing = await this.shippingInboxRepo.findOne({
          where: { eventId }
        });

        if (!existing) {

          const inbox = this.shippingInboxRepo.create({
            eventId,
            eventType: "order.placed"
          });

          await this.shippingInboxRepo.save(inbox);

          await this.shippingService.saveOrder(
            data.message.orderId,
            data.message.products
          );
        }

        await this.tryProcess(data.message.orderId, channel);
      }

      channel.ack(msg);
    });

    // BILLING STATUS
    channel.consume("shipping_billing_order_status_queue", async (msg: any) => {

      if (!msg) return;

      const data = JSON.parse(msg.content.toString());

      if (data.status !== "success") {
        channel.ack(msg);
        return;
      }

      const eventId = `${data.orderId}_order.billed`;

      const existing = await this.shippingInboxRepo.findOne({
        where: { eventId }
      });

      if (!existing) {

        const inbox = this.shippingInboxRepo.create({
          eventId,
          eventType: "order.billed"
        });

        await this.shippingInboxRepo.save(inbox);
      }

      await this.tryProcess(data.orderId, channel);

      channel.ack(msg);
    });
  }

  private async tryProcess(orderId: string, channel: any) {

    const placed = await this.shippingInboxRepo.findOne({
      where: { eventId: `${orderId}_order.placed` }
    });

    const billed = await this.shippingInboxRepo.findOne({
      where: { eventId: `${orderId}_order.billed` }
    });

    const shipped = await this.shippingInboxRepo.findOne({
      where: { eventId: `${orderId}_order.shipped` }
    });

    if (!placed || !billed) return;

    if (shipped) return;

    const result = await this.shippingService.handleShipping(orderId);

    const shippedEventId = `${orderId}_order.shipped`;

    const inbox = this.shippingInboxRepo.create({
      eventId: shippedEventId,
      eventType: "order.shipped"
    });

    await this.shippingInboxRepo.save(inbox);

    const payload = {
      orderId,
      eventType: "order.shipped",
      status: result
    };

    channel.publish(
      "shipping_order_status_exchange",
      "",
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    console.log("Shipping result:", orderId, result);
  }
}