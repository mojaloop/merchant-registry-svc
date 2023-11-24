import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm'

import { AuditActionType, type AuditTrasactionStatus } from 'shared-lib'

@Entity('audits')
export class AuditEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'simple-enum', enum: AuditActionType, nullable: false })
    action_type!: AuditActionType

  @Column({ nullable: false, length: 512 })
    application_module!: string

  @Column({ nullable: false, length: 4096 })
    event_description!: string

  @Column({ nullable: true, length: 255 })
    entity_name!: string

  @Column({ nullable: true })
    transaction_status!: AuditTrasactionStatus

  @Column({ nullable: true, length: 4096 })
    old_value!: string

  @Column({ nullable: true, length: 4096 })
    new_value!: string

  @Column({ nullable: true })
    dfsp_id!: number

  @CreateDateColumn()
    created_at!: Date
}
