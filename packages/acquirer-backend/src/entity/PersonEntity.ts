import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn
} from 'typeorm'
import { BusinessPersonLocationEntity } from './BusinessPersonLocationEntity'

@Entity('persons')
export class PersonEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    name!: string

  @Column({ nullable: true, length: 255 })
    email!: string

  @Column({ nullable: false, length: 255 })
    phone_number!: string

  @OneToOne(() => BusinessPersonLocationEntity)
  @JoinColumn()
    businessPersonLocation!: BusinessPersonLocationEntity

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
