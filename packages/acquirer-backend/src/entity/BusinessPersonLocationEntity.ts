import { Entity, OneToOne } from 'typeorm'
import { LocationEntity } from './LocationEntity'
import { PersonEntity } from './PersonEntity'

@Entity('business_person_locations')
export class BusinessPersonLocationEntity extends LocationEntity {
  @OneToOne(() => PersonEntity, (person: PersonEntity) => person.businessPersonLocation)
    person!: PersonEntity
}
