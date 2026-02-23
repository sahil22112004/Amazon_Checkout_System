import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto)
  }

  
  @Patch(':id/placeOrder')
  async placeOrder(@Param('id') orderId: string,@Body() dto: CreateOrderDto) {
    return this.ordersService.placeOrder(orderId,dto);
  }

  @Get()
  getOrders() {
    return this.ordersService.getOrders()
  }
}