import {
  Entity, Column, ManyToMany
} from 'typeorm'
import { MerchantEntity } from './MerchantEntity'
import { BusinessOwnerIDType } from 'shared-lib'
import { PersonEntity } from './PersonEntity'

@Entity('business_owners')
export class BusinessOwnerEntity extends PersonEntity {
  @Column({
    type: 'simple-enum',
    enum: BusinessOwnerIDType,
    nullable: true,
    default: BusinessOwnerIDType.NATIONAL_ID
  })
    identificaton_type!: BusinessOwnerIDType

  @Column({ nullable: true, length: 255 })
    identification_number!: string

  @ManyToMany(() => MerchantEntity, merchant => merchant.business_owners)
    merchants!: MerchantEntity[]
}
