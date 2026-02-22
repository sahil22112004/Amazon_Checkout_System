import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('billing_accounts')
export class BillingAccount {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    customerId: string

    @Column()
    balance: number

}