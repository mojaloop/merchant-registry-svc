import {
  Entity, ManyToOne, OneToOne
} from 'typeorm'
import { BusinessPersonLocationEntity } from './BusinessPersonLocationEntity'
import { MerchantEntity } from './MerchantEntity'
import { PersonEntity } from './PersonEntity'

@Entity('contact_persons')
export class ContactPersonEntity extends PersonEntity {
  @OneToOne(() => BusinessPersonLocationEntity)
    businessPersonLocation!: BusinessPersonLocationEntity

  @ManyToOne(
    () => MerchantEntity,
    merchant => merchant.contact_persons,
    { onDelete: 'SET NULL' }
  )
    merchant!: MerchantEntity
}
