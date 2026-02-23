import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { Order } from './entities/order.entity'
import { SalesOutbox } from '../outbox/sales-outbox.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Order,SalesOutbox])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}