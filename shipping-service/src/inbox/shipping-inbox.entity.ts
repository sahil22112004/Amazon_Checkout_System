import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('shipping_inbox')
export class ShippingInbox {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true })
    eventId: string

    @Column()
    eventType: string

    @CreateDateColumn()
    receivedAt: Date

}