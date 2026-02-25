import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ShippingOrderItem } from "../../shpping/entities/placedOrderItem.entity"
import { Repository } from "typeorm"
import { Products } from "../../shpping/entities/product.entity"

@Injectable()
export class ShippingorderService {

  constructor(
    @InjectRepository(ShippingOrderItem)
    private shippingOrderRepo: Repository<ShippingOrderItem>,

    @InjectRepository(Products)
    private productRepo: Repository<Products>,
  ) {}

  async saveOrder(orderId: string, products: any[]) {

    const existing = await this.shippingOrderRepo.findOne({
      where: { order_id: orderId }
    })

    if (existing) return

    const order = this.shippingOrderRepo.create({
      order_id: orderId,
      products
    })

    await this.shippingOrderRepo.save(order)
  }

  async handleShipping(orderId: string) {

    const order = await this.shippingOrderRepo.findOne({
      where: { order_id: orderId }
    })

    if (!order) return "failed"

    for (const item of order.products) {

      const product = await this.productRepo.findOne({
        where: { product_id: item.productId }
      })

      if (!product) return "failed"

      if (Number(product.quantity_on_hand) < item.quantity) {
        return "failed"
      }
    }

    for (const item of order.products) {

      const product = await this.productRepo.findOne({
        where: { product_id: item.productId }
      })
      if (!product) return "failed"

      product.quantity_on_hand =
        Number(product.quantity_on_hand) - item.quantity

      await this.productRepo.save(product)
    }

    return "success"
  }
}