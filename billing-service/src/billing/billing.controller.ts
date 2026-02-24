import { Controller, Post, Body } from '@nestjs/common'
import { BillingService } from './billing.service'
import { PlaceBillingOrderDto } from './dto/createBillingOrder.dto'

@Controller('billing')
export class BillingController {

  constructor(private readonly billingService: BillingService) {}

  @Post('order')
  async createBillingOrder(@Body() dto: PlaceBillingOrderDto) {
    return this.billingService.createBillingOrder(dto)
  }
}