import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('shipping_orders')
export class ShippingOrder {

  @PrimaryColumn('uuid')
  order_id: string;

  @Column()
  shipping_address: string;

  @CreateDateColumn()
  created_at: Date;

}