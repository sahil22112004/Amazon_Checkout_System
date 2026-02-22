import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('billing_inbox')
export class BillingInbox {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    eventId: string

    @Column()
    eventType: string

    @CreateDateColumn()
    receivedAt: Date

}