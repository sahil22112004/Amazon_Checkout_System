import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Order } from './entities/order.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { SalesOutbox, OutboxStatus } from '../outbox/sales-outbox.entity'
import { Products } from './entities/product.entity'

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Products)
    private productRepository: Repository<Products>,

    @InjectRepository(SalesOutbox)
    private outboxRepository: Repository<SalesOutbox>,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto) {

  const existing = await this.orderRepository.findOne({
    where: { orderId: createOrderDto.orderId },
  });

  if (existing) {
    throw new HttpException('Order already exists', 409);
  }

  let totalAmount = 0;

  for (const p of createOrderDto.products) {

    const product = await this.productRepository.findOne({
      where: { product_id: p.productId }
    });

    if (!product) {
      throw new HttpException(`Product ${p.productId} not found`, 404);
    }

    totalAmount += Number(product.price) * p.quantity;
  }

  const order = this.orderRepository.create({
    orderId: createOrderDto.orderId,
    customerId: createOrderDto.customerId,
    products: createOrderDto.products,
    orderTotal: totalAmount,
    status: 'PENDING'
  });

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
          products: order.products,
          orderTotal: order.orderTotal,
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