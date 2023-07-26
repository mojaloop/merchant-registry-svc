import {
  Entity, Column, PrimaryGeneratedColumn, ManyToOne,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'
import { MerchantEntity } from './MerchantEntity'

@Entity('business_licenses')
export class BusinessLicenseEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: true, length: 255 })
    license_number!: string

  @Column({ nullable: true, length: 512 })
    license_document_link!: string

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date

  // merchant_id
  @ManyToOne(
    () => MerchantEntity,
    merchant => merchant.business_licenses,
    { onDelete: 'SET NULL' }
  )
    merchant!: MerchantEntity
}
