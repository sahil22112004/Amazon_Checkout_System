import { Controller, Post, Body } from '@nestjs/common'
import { AppService } from './app.service'

@Controller('api/v1')
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Post('order')
  async createOrder(@Body() body: any) {
    return this.appService.createOrder(body)
  }
}