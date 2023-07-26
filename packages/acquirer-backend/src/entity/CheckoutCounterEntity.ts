import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'
import { MerchantEntity } from './MerchantEntity'
import { MerchantLocationEntity } from './MerchantLocationEntity'

@Entity('checkout_counters')
export class CheckoutCounterEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: true, length: 255 })
    description!: string

  @Column({ nullable: true, length: 255 })
    notification_number!: string

  @Column({ nullable: false, length: 255, default: 'PAYINTO_ID' })
    alias_type!: string

  @Column({ nullable: false, length: 255, unique: true })
    alias_value!: string

  @Column({ nullable: true })
    merchant_registry_id!: number

  // merchant_id
  @ManyToOne(
    () => MerchantEntity, merchant => merchant.checkout_counters,
    { onDelete: 'SET NULL' }
  )
    merchant!: MerchantEntity

  // merchant_location_id
  @ManyToOne(
    () => MerchantLocationEntity,
    merchantLocation => merchantLocation.checkout_counters,
    { onDelete: 'SET NULL' }
  )
    checkout_location!: MerchantLocationEntity

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
