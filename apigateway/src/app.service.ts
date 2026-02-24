import { Injectable, HttpException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class AppService {

  constructor(private readonly httpService: HttpService) {}

  async createOrder(payload: any) {

    try {

      const salesCall = firstValueFrom(
        this.httpService.post(
          'http://localhost:3000/orders',
          {
            orderId: payload.order_id,
            customerId: payload.customer_id,
            products: payload.products
          }
        )
      )

      const billingCall = firstValueFrom(
        this.httpService.post(
          'http://localhost:3001/billing/order',
          {
            orderId: payload.order_id,
            billingAccountId: payload.billing_account_id,
            billingAddress: payload.billing_address
          }
        )
      )

      const shippingCall = firstValueFrom(
        this.httpService.post(
          'http://localhost:3002/shipping/order',
          {
            orderId: payload.order_id,
            shippingAddress: payload.shipping_address
          }
        )
      )

      const [salesRes, billingRes, shippingRes] =
        await Promise.all([salesCall, billingCall, shippingCall])

      return {
        sales: salesRes.data,
        billing: billingRes.data,
        shipping: shippingRes.data
      }

    } catch (error) {
      throw new HttpException('One of the services failed', 500)
    }
  }
}