import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { OrderStatus } from './entities/order-status.enum'
import { SalesOutbox, OutboxStatus } from '../outbox/sales-outbox.entity'

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    @InjectRepository(SalesOutbox)
    private outboxRepository: Repository<SalesOutbox>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {

    return this.dataSource.transaction(async (manager) => {

      const totalAmount = dto.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )

      const order = manager.create(Order, {
        customerId: dto.customerId,
        totalAmount,
        status: OrderStatus.PLACED,
        items: dto.items,
      })

      const savedOrder = await manager.save(order)

      const outbox = manager.create(SalesOutbox, {
        eventType: 'order.placed',
        payload: {
          orderId: savedOrder.id,
          customerId: savedOrder.customerId,
          totalAmount: savedOrder.totalAmount,
        },
        status: OutboxStatus.PENDING,
      })

      await manager.save(outbox)

      return savedOrder
    })
  }

  async getOrders(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['items'] })
  }
}