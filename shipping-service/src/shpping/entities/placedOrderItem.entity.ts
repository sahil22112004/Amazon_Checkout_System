import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('shipping_orders_item')
export class ShippingOrderItem {

  @PrimaryColumn('uuid')
  order_id: string;

  @Column({ type: 'json' })
  products: {
    productId: string;
    quantity: number;
  }[];

  @CreateDateColumn()
  created_at: Date;

}