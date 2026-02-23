import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BillingAccount } from "../../entities/billing-account.entity"
import { Payment } from "../../entities/payment.entity"

@Injectable()
export class BillingService {

  constructor(
    @InjectRepository(BillingAccount)
    private accountRepo: Repository<BillingAccount>,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async handleOrderPlaced(payload: any) {
    console.log('comming in thess',payload)

    const account = await this.accountRepo.findOne({
      where: { card_number: payload.customerId }
    })

    if (!account) {
      console.log("Billing account not found")
      return {message:'payment_failed'}
    }

    if (Number(account.balance) < Number(payload.orderTotal)) {
      // throw new Error("Insufficient balance")
      console.log("Insufficient balance")
      return {message:'payment_failed'}
    }

    account.balance =
      Number(account.balance) -
      Number(payload.orderTotal)

    await this.accountRepo.save(account)

    const payment = this.paymentRepo.create({
      orderId: payload.orderId,
      amount: payload.orderTotal,
      status: "PAID",
    })

    await this.paymentRepo.save(payment)

    return {message:'payment_successfully'}
  }
}