import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, ManyToOne
} from 'typeorm'
import { PortalUserEntity } from './PortalUserEntity'

import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { DFSPEntity } from './DFSPEntity'

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

  @ManyToOne(() => PortalUserEntity, portalUser => portalUser.audits, { onDelete: 'SET NULL' })
    portal_user!: PortalUserEntity | null

  @ManyToOne(() => DFSPEntity, dfsp => dfsp.audits)
    dfsp!: DFSPEntity

  @CreateDateColumn()
    created_at!: Date
}
