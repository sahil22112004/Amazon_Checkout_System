import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BillingOrder } from './entities/billingOrder.entity'
import { PlaceBillingOrderDto } from './dto/createBillingOrder.dto'

@Injectable()
export class BillingService {

  constructor(
    @InjectRepository(BillingOrder)
    private billingOrderRepository: Repository<BillingOrder>,
  ) {}

  async createBillingOrder(dto: PlaceBillingOrderDto) {
    console.log('comming in billing craeet ordre ',dto)

    const billingOrder = this.billingOrderRepository.create({
      order_id: dto.orderId,
      billing_account_id: 'a2f89d3c-b671-4fd6-88cd-f8cdb66f09e1',
      billing_address: dto.billingAddress,
    })

    return await this.billingOrderRepository.save(billingOrder)
  }
}