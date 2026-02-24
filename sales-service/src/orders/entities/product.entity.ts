import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('products')
export class Products {
  @PrimaryColumn('uuid')
  product_id: string;

  @Column({ type: 'decimal'})
  price: number;

}