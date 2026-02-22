import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BillingAccount } from "./entities/billing-account.entity"
import { Payment } from "./entities/payment.entity"

@Injectable()
export class BillingService {

  constructor(
    @InjectRepository(BillingAccount)
    private accountRepo: Repository<BillingAccount>,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async handleOrderPlaced(payload: any) {

    const account = await this.accountRepo.findOne({
      where: { customerId: payload.customerId }
    })

    if (!account) {
      throw new Error("Billing account not found")
    }

    if (Number(account.balance) < Number(payload.totalAmount)) {
      throw new Error("Insufficient balance")
    }

    account.balance =
      Number(account.balance) -
      Number(payload.totalAmount)

    await this.accountRepo.save(account)

    const payment = this.paymentRepo.create({
      orderId: payload.orderId,
      amount: payload.totalAmount,
      status: "PAID",
    })

    await this.paymentRepo.save(payment)
  }
}