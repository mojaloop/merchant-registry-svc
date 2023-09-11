import {
  Entity,
  PrimaryGeneratedColumn, Column,
  OneToMany,
  ManyToOne
} from 'typeorm'
import { CountryEntity } from './CountryEntity'
import { DistrictEntity } from './DistrictEntity'

@Entity('country_subdivisions')
export class CountrySubdivisionEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    name!: string

  @ManyToOne(() => CountryEntity, country => country.subdivisions)
    country!: CountryEntity

  @OneToMany(() => DistrictEntity, district => district.subdivision)
    districts!: DistrictEntity[]
}
