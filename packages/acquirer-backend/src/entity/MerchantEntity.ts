import {
  Entity,
  Column, JoinColumn, PrimaryGeneratedColumn,
  ManyToOne, OneToMany, ManyToMany,
  CreateDateColumn, UpdateDateColumn, JoinTable
} from 'typeorm'

import { CurrencyEntity } from './CurrencyEntity'
import { MerchantCategoryEntity } from './MerchantCategoryEntity'
import { PortalUserEntity } from './PortalUserEntity'
import { MerchantLocationEntity } from './MerchantLocationEntity'
import {
  MerchantAllowBlockStatus,
  MerchantRegistrationStatus,
  MerchantType,
  NumberOfEmployees
} from 'shared-lib'
import { CheckoutCounterEntity } from './CheckoutCounterEntity'
import { BusinessLicenseEntity } from './BusinessLicenseEntity'
import { BusinessOwnerEntity } from './BusinessOwnerEntity'
import { ContactPersonEntity } from './ContactPersonEntity'
import { DFSPEntity } from './DFSPEntity'

@Entity('merchants')
export class MerchantEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: true, length: 255 })
    dba_trading_name!: string

  @Column({ nullable: true, length: 255 })
    registered_name!: string

  @Column({
    type: 'enum',
    enum: NumberOfEmployees,
    nullable: true,
    default: NumberOfEmployees.ONE_TO_FIVE
  })
    employees_num!: NumberOfEmployees

  @Column({
    nullable: true
  })
    monthly_turnover!: string

  @Column({
    type: 'enum',
    enum: MerchantType,
    nullable: true,
    default: MerchantType.INDIVIDUAL
  })
    merchant_type!: MerchantType

  @Column({
    type: 'enum',
    enum: MerchantAllowBlockStatus,
    nullable: true,
    default: MerchantAllowBlockStatus.PENDING
  })
    allow_block_status!: MerchantAllowBlockStatus

  @Column({
    type: 'enum',
    enum: MerchantRegistrationStatus,
    nullable: true,
    default: MerchantRegistrationStatus.DRAFT
  })
    registration_status!: MerchantRegistrationStatus

  @Column({ nullable: true, length: 2048 })
    registration_status_reason!: string

  @ManyToOne(
    () => PortalUserEntity,
    portalUser => portalUser.created_merchants,
    { onDelete: 'SET NULL' }
  )
    created_by!: PortalUserEntity

  @ManyToOne(
    () => PortalUserEntity,
    portalUser => portalUser.checked_merchants,
    { onDelete: 'SET NULL' }
  )

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
    merchantLocation => merchantLocation.merchant,
    { onDelete: 'SET NULL' }
  )
    locations!: MerchantLocationEntity[]

  @OneToMany(
    () => CheckoutCounterEntity,
    checkoutCounter => checkoutCounter.merchant,
    { onDelete: 'SET NULL' }
  )
    checkout_counters!: CheckoutCounterEntity[]

  @OneToMany(
    () => BusinessLicenseEntity,
    businessLicense => businessLicense.merchant,
    { onDelete: 'CASCADE' }
  )
    business_licenses!: BusinessLicenseEntity[]

  @ManyToMany(
    () => BusinessOwnerEntity,
    businessOwner => businessOwner.merchants
  )
  @JoinTable()
    business_owners!: BusinessOwnerEntity[]

  @OneToMany(
    () => ContactPersonEntity,
    contactPerson => contactPerson.merchant,
    { onDelete: 'CASCADE' }
  )
    contact_persons!: ContactPersonEntity[]

  @ManyToMany(
    () => DFSPEntity,
    dfsp => dfsp.merchants,
    { onDelete: 'CASCADE' }
  )
  @JoinTable()
    dfsps!: DFSPEntity[]

  @ManyToOne(
    () => DFSPEntity,
    dfsp => dfsp.defaulted_merchants,
    { onDelete: 'SET NULL' }
  )
    default_dfsp!: DFSPEntity

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
