import { Entity, Column, ManyToOne, OneToMany } from 'typeorm'
import { LocationEntity } from './LocationEntity'
import { MerchantLocationType } from 'shared-lib'
import { MerchantEntity } from './MerchantEntity'
import { CheckoutCounterEntity } from './CheckoutCounterEntity'

@Entity('merchant_locations')
export class MerchantLocationEntity extends LocationEntity {
  @Column({
    type: 'enum',
    enum: MerchantLocationType,
    nullable: false,
    default: MerchantLocationType.PHYSICAL
  })
    location_type!: MerchantLocationType

  @Column({ nullable: true, length: 255 })
    web_url!: string

  // merchant_id
  @ManyToOne(() => MerchantEntity, merchant => merchant.locations)
    merchant!: MerchantEntity

  @OneToMany(
    () => CheckoutCounterEntity,
    checkoutCounter => checkoutCounter.checkout_location
  )
    checkout_counters!: CheckoutCounterEntity[]
}
