import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BillingAccount } from "../../entities/billing-account.entity"
import { Payment } from "../../entities/payment.entity"
import { BillingOrder } from "../../billing/entities/billingOrder.entity"

@Injectable()
export class BillingService {

  constructor(
    @InjectRepository(BillingAccount)
    private accountRepo: Repository<BillingAccount>,

    @InjectRepository(BillingOrder)
    private billingOrderRepo: Repository<BillingOrder>,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async handleOrderPlaced(payload: any) {

  console.log("payload is", payload)

  const billingOrder = await this.billingOrderRepo.findOne({
    where: { order_id: payload.orderId }
  })

  if (!billingOrder) {
    console.log("Billing order not found")
    return { message: 'payment_failed' }
  }

  const account = await this.accountRepo.findOne({
    where: { billing_account_id: billingOrder.billing_account_id }
  })

  if (!account) {
    console.log("Billing account not found")
    return { message: 'payment_failed' }
  }

  if (Number(account.balance) < Number(payload.orderTotal)) {
    console.log("Insufficient balance")
    return { message: 'payment_failed' }
  }

  account.balance =
    Number(account.balance) - Number(payload.orderTotal)

  await this.accountRepo.save(account)

  const payment = this.paymentRepo.create({
    orderId: payload.orderId,
    amount: payload.orderTotal,
    status: "PAID",
  })

  await this.paymentRepo.save(payment)

  return { message: 'payment_successfully' }
}
}