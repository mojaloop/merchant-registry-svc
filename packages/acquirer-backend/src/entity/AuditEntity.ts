import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, ManyToOne
} from 'typeorm'
import { PortalUserEntity } from './PortalUserEntity'

import { AuditActionType, AuditTransactionStatus } from 'shared-lib'

@Entity('audits')
export class AuditEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'enum', enum: AuditActionType, nullable: false })
    action_type!: AuditActionType

  @Column({ nullable: false, length: 512 })
    application_module!: string

  @Column({ nullable: false, length: 4096 })
    event_description!: string

  @Column({ nullable: true, length: 255 })
    entity_name!: string

  @Column({ nullable: true })
    transaction_status!: AuditTransactionStatus

  @Column({ nullable: true, length: 4096 })
    old_value!: string

  @Column({ nullable: true, length: 4096 })
    new_value!: string

  @ManyToOne(() => PortalUserEntity, portalUser => portalUser.audits)
    portal_user!: PortalUserEntity

  @CreateDateColumn()
    created_at!: Date
}
