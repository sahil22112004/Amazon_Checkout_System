import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm'
import { OrderItem } from './order-item.entity'

@Entity('orders')
export class Order {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    customerId: string

    @Column({ type: 'numeric', precision: 12, scale: 2 })
    totalAmount: number

    @Column({
        type: 'enum',
        enum: ['PENDING', 'PLACED', 'BILLED', 'READY_TO_SHIP'],
        default: 'PENDING'
    })
    status: string

    @CreateDateColumn()
    createdAt: Date

    @OneToMany(() => OrderItem, (item) => item.order)
    items: OrderItem[]

}