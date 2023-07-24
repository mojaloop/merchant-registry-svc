import {
  Entity,
  Column, JoinColumn, PrimaryGeneratedColumn,
  ManyToOne, OneToMany, ManyToMany,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'

import { CurrencyEntity } from './CurrencyEntity'
import { MerchantCategoryEntity } from './MerchantCategoryEntity'
import { PortalUserEntity } from './PortalUserEntity'
import { MerchantLocationEntity } from './MerchantLocationEntity'
import {
  MerchantAllowBlockStatus,
  MerchantRegistrationStatus
} from 'shared-lib'
import { CheckoutCounterEntity } from './CheckoutCounterEntity'
import { BusinessLicenseEntity } from './BusinessLicenseEntity'
import { BusinessOwnerEntity } from './BusinessOwnerEntity'
import { ContactPersonEntity } from './ContactPersonEntity'
import { DFSPMerchantRelationsEntity } from './DFSPMerchantRelationsEntity'

@Entity('merchants')
export class MerchantEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    dba_trading_name!: string

  @Column({ nullable: true, length: 255 })
    registered_name!: string

  @Column({ nullable: true, default: '0 - 5' })
    employees_num!: string

  @Column({
    nullable: false,
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0
  })
    monthly_turnover!: number

  @Column({
    type: 'enum',
    enum: MerchantAllowBlockStatus,
    nullable: false,
    default: MerchantAllowBlockStatus.PENDING
  })
    allow_block_status!: MerchantAllowBlockStatus

  @Column({
    type: 'enum',
    enum: MerchantRegistrationStatus,
    nullable: false,
    default: MerchantRegistrationStatus.DRAFT
  })
    registration_status!: MerchantRegistrationStatus

  @Column({ nullable: true, length: 2048 })
    registration_status_reason!: string

  @ManyToOne(() => PortalUserEntity, portalUser => portalUser.created_merchants)
    created_by!: PortalUserEntity

  @ManyToOne(() => PortalUserEntity, portalUser => portalUser.checked_merchants)
    checked_by!: PortalUserEntity

  @ManyToOne(() => CurrencyEntity, currency => currency.merchants)
  @JoinColumn({ name: 'currency_code' })
    currency_code!: string

  @ManyToOne(
    () => MerchantCategoryEntity,
    merchantCategory => merchantCategory.merchants
  )

  @JoinColumn({ name: 'category_code' })
    category_code!: string

  @OneToMany(
    () => MerchantLocationEntity,
    merchantLocation => merchantLocation.merchant
  )
    locations!: MerchantLocationEntity[]

  @OneToMany(
    () => CheckoutCounterEntity,
    checkoutCounter => checkoutCounter.merchant
  )
    checkout_counters!: CheckoutCounterEntity[]

  @OneToMany(() => BusinessLicenseEntity, businessLicense => businessLicense.merchant)
    business_licenses!: BusinessLicenseEntity[]

  @ManyToMany(() => BusinessOwnerEntity, businessOwner => businessOwner.merchants)
    business_owners!: BusinessOwnerEntity[]

  @OneToMany(
    () => ContactPersonEntity,
    contactPerson => contactPerson.merchant
  )
    contact_persons!: ContactPersonEntity[]

  @OneToMany(() => DFSPMerchantRelationsEntity, relation => relation.merchant)
    dfsp_merchant_relations!: DFSPMerchantRelationsEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
