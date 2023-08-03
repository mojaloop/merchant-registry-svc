import { Entity } from 'typeorm'
import { LocationEntity } from './LocationEntity'

@Entity('business_person_locations')
export class BusinessPersonLocationEntity extends LocationEntity {
}
