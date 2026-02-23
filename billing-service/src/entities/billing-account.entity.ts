import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('billing_accounts')
export class BillingAccount {

    @PrimaryGeneratedColumn('uuid')
    billing_account_id: string

    @Column()
    card_number: string

    @Column()
    balance: number

}