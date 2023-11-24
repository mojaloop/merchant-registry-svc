import {
  Entity,
  PrimaryGeneratedColumn, Column,
  OneToMany
} from 'typeorm'
import { CountrySubdivisionEntity } from './CountrySubdivisionEntity'

@Entity('countries')
export class CountryEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    name!: string

  @Column({ nullable: false, length: 2 })
    code!: string

  @OneToMany(() => CountrySubdivisionEntity, subdivision => subdivision.country)
    subdivisions!: CountrySubdivisionEntity[]
}
