import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

export enum OutboxStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED'
}

@Entity('sales_outbox')
export class SalesOutbox {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    eventType: string

    @Column({ type: 'jsonb' })
    messagePayload: any

    @Column({
        type: 'enum',
        enum: OutboxStatus,
        default: OutboxStatus.PENDING
    })
    status: OutboxStatus

    @CreateDateColumn()
    createdAt: Date

}