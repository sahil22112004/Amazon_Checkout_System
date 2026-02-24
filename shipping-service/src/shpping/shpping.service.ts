import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ShippingOrder } from './entities/shippingorder.entity'
import { CreateShippingDto } from './dto/createOrder.dto'

@Injectable()
export class ShppingService {

  constructor(
    @InjectRepository(ShippingOrder)
    private shippingRepo: Repository<ShippingOrder>,
  ) {}

  async createShippingOrder(dto: CreateShippingDto) {

    const shippingOrder = this.shippingRepo.create({
      order_id: dto.orderId,
      shipping_address: dto.shippingAddress,
    })

    return await this.shippingRepo.save(shippingOrder)
  }
}