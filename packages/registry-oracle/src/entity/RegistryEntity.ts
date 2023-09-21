import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'

@Entity('registry')
export class RegistryEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false })
    merchant_id!: number

  @Column({ nullable: false})
    dfsp_id!: string

  @Column({ nullable: false })
    dfsp_name!: string

  @Column({ nullable: false})
    checkout_counter_id!: number

  @Column({ nullable: false, default: 'PAYINTOID'})
    alias_type!: string

  @Column({ nullable: false })
    alias_value!: string

  @Column({ nullable: false })
    currency_code!: string

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
