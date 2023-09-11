import {
  Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm'

export class LocationEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: true, length: 255 })
    address_type!: string

  @Column({ nullable: true, length: 255 })
    department!: string

  @Column({ nullable: true, length: 255 })
    sub_department!: string

  @Column({ nullable: true, length: 255 })
    street_name!: string

  @Column({ nullable: true, length: 255 })
    building_number!: string

  @Column({ nullable: true, length: 255 })
    building_name!: string

  @Column({ nullable: true, length: 255 })
    floor_number!: string

  @Column({ nullable: true, length: 255 })
    room_number!: string

  @Column({ nullable: true, length: 255 })
    post_box!: string

  @Column({ nullable: true, length: 255 })
    postal_code!: string

  @Column({ nullable: true, length: 255 })
    town_name!: string

  @Column({ nullable: true, length: 255 })
    district_name!: string

  @Column({ nullable: true, length: 255 })
    country_subdivision!: string

  @Column({ nullable: true, length: 1024 })
    country!: string

  @Column({ nullable: true, length: 1024 })
    address_line!: string

  @Column({ nullable: true, length: 255 })
    latitude!: string

  @Column({ nullable: true, length: 255 })
    longitude!: string

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
