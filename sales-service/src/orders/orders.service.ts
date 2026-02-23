import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Order } from './entities/order.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { SalesOutbox, OutboxStatus } from '../outbox/sales-outbox.entity'

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(SalesOutbox)
    private outboxRepository: Repository<SalesOutbox>,
  ) { }

  async createOrder(CreateOrderDto: CreateOrderDto) {

    const existing = await this.orderRepository.findOne({
      where: { orderId: CreateOrderDto.orderId },
    });
    if (existing) {
      throw new HttpException('This is a custom error message', 409);
    }
    const order = this.orderRepository.create({
      orderId: CreateOrderDto.orderId,
      customerId: CreateOrderDto.customerId,
      products: CreateOrderDto.products,
      orderTotal: CreateOrderDto.orderTotal
    })
    return await this.orderRepository.save(order);

  }

  async placeOrder(id:string, CreateOrderDto: CreateOrderDto){
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const outboxRepo = manager.getRepository(SalesOutbox);

      const order = await orderRepo.findOne({
        where: { orderId: id },
      });

      if (!order) {
        throw new HttpException('Order not found', 404);
    }
      

      if (order.status !== 'PENDING') {
        throw new HttpException(
          `Order cannot be placed from status ${order.status}`,403
        );
      }

      order.status = 'PLACED';
      await orderRepo.save(order);

      const outbox = outboxRepo.create({
        eventType: 'order.placed',
        messagePayload: {
          orderId: order.orderId,
          orderTotal: order.orderTotal,
          billingAccountId: CreateOrderDto.billingAccountId,
        }
      });

      await outboxRepo.save(outbox);

      return order;
    });
  }

  async getOrders(){
    return this.orderRepository.find()
  }
}