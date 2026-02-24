import { Controller, Post, Body } from '@nestjs/common'
import { ShppingService } from './shpping.service'
import { CreateShippingDto } from './dto/createOrder.dto'

@Controller('shipping')
export class ShppingController {

  constructor(private readonly shppingService: ShppingService) {}

  @Post('order')
  async create(@Body() dto: CreateShippingDto) {
    return this.shppingService.createShippingOrder(dto)
  }
}