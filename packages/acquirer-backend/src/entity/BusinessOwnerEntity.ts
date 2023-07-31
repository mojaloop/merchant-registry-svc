import {
  Entity, Column, ManyToMany, OneToOne
} from 'typeorm'
import { MerchantEntity } from './MerchantEntity'
import { BusinessOwnerIDType } from 'shared-lib'
import { PersonEntity } from './PersonEntity'
import { BusinessPersonLocationEntity } from './BusinessPersonLocationEntity'

@Entity('business_owners')
export class BusinessOwnerEntity extends PersonEntity {
  @Column({
    type: 'enum',
    enum: BusinessOwnerIDType,
    nullable: false,
    default: BusinessOwnerIDType.NATIONAL_ID
  })
    identificaton_type!: BusinessOwnerIDType

  @Column({ nullable: false, length: 255 })
    identification_number!: string

  @OneToOne(() => BusinessPersonLocationEntity, location => location.person)
    businessPersonLocation!: BusinessPersonLocationEntity

  @ManyToMany(() => MerchantEntity, merchant => merchant.business_owners)
    merchants!: MerchantEntity[]
}
