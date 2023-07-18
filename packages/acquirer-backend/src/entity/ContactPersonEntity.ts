import {
  Entity, ManyToOne, OneToOne
} from 'typeorm'
import { BusinessPersonLocation } from './BusinessPersonLocationEntity'
import { MerchantEntity } from './MerchantEntity'
import { PersonEntity } from './PersonEntity'

@Entity('contact_persons')
export class ContactPersonEntity extends PersonEntity {
  // merchant_id
  @OneToOne(() => BusinessPersonLocation, businessPersonLocation => businessPersonLocation.person)
    businessPersonLocation!: BusinessPersonLocation

  @ManyToOne(() => MerchantEntity, merchant => merchant.contact_persons)
    merchant!: MerchantEntity
}
