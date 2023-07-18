import {
  Entity,
  Column, PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'
import { PortalUserEntity } from './PortalUserEntity'

import { AuditActionType } from 'shared-lib'

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

  @Column({ nullable: true, length: 255 })
    old_value!: string

  @Column({ nullable: true, length: 255 })
    new_value!: string

  @OneToMany(() => PortalUserEntity, portalUser => portalUser.audits)
    portal_user!: PortalUserEntity

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
