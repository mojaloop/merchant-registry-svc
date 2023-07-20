import {
  Entity, ManyToOne, OneToOne
} from 'typeorm'
import { BusinessPersonLocationEntity } from './BusinessPersonLocationEntity'
import { MerchantEntity } from './MerchantEntity'
import { PersonEntity } from './PersonEntity'

@Entity('contact_persons')
export class ContactPersonEntity extends PersonEntity {
  // merchant_id
  @OneToOne(() => BusinessPersonLocationEntity, location => location.person)
    businessPersonLocation!: BusinessPersonLocationEntity

  @ManyToOne(() => MerchantEntity, merchant => merchant.contact_persons)
    merchant!: MerchantEntity
}
