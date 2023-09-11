
import {
  Entity,
  PrimaryGeneratedColumn, Column,
  ManyToOne
} from 'typeorm'
import { CountrySubdivisionEntity } from './CountrySubdivisionEntity'

@Entity('districts')
export class DistrictEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    name!: string

  @ManyToOne(() => CountrySubdivisionEntity, subdivision => subdivision.districts)
    subdivision!: CountrySubdivisionEntity
}
