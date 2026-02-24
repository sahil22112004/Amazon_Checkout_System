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

    const billingOrder = this.billingOrderRepository.create({
      order_id: dto.orderId,
      billing_account_id: dto.billingAccountId,
      billing_address: dto.billingAddress,
    })

    return await this.billingOrderRepository.save(billingOrder)
  }
}