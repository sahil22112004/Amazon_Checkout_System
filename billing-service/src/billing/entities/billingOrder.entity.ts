import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('billingOrder')
export class BillingOrder {

    @PrimaryGeneratedColumn('uuid')
    order_id: string

    @Column('uuid')
    billing_account_id: string

    @Column()
    billing_address: number

}