import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

export enum OutboxStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED'
}

@Entity({ name: 'sales_outbox', schema: 'sales' })
export class SalesOutbox {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    eventType: string

    @Column({ type: 'jsonb' })
    payload: any

    @Column({
        type: 'enum',
        enum: OutboxStatus,
        default: OutboxStatus.PENDING
    })
    status: OutboxStatus

    @CreateDateColumn()
    createdAt: Date

}