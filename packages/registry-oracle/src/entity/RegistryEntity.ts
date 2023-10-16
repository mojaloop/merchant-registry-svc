import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'

@Entity('registry')
export class RegistryEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: true })
    merchant_id!: number

  @Column({ nullable: false})
    fspId!: string

  @Column({ nullable: true })
    dfsp_name!: string

  @Column({ nullable: true })
    checkout_counter_id!: number

  @Column({ nullable: false, default: 'MERCHANT_PAYINTOID'})
    alias_type!: string

  @Column({ nullable: false })
    alias_value!: string

  @Column({ nullable: false, default: false })
    is_incremental_head!: boolean

  @Column({ nullable: false })
    currency!: string

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
