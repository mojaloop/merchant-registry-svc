import {
  Entity, ManyToOne
} from 'typeorm'
import { MerchantEntity } from './MerchantEntity'
import { PersonEntity } from './PersonEntity'

@Entity('contact_persons')
export class ContactPersonEntity extends PersonEntity {
  @ManyToOne(
    () => MerchantEntity,
    merchant => merchant.contact_persons,
    { onDelete: 'SET NULL' }
  )
    merchant!: MerchantEntity
}
