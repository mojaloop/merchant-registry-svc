import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'
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

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
