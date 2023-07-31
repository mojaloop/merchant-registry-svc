import { Entity, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm'
import { AuditEntity } from './AuditEntity'
import { MerchantEntity } from './MerchantEntity'
import { PortalUserStatus, PortalUserType } from 'shared-lib'
import { PersonEntity } from './PersonEntity'
import { DFSPEntity } from './DFSPEntity'
import { PortalRoleEntity } from './PortalRoleEntity'

@Entity('portal_users')
export class PortalUserEntity extends PersonEntity {
  // password hashed
  @Column({ nullable: false, length: 2048 })
    password!: string

  @Column({
    type: 'enum',
    enum: PortalUserType,
    nullable: false
  })
    user_type!: PortalUserType

  @Column({
    type: 'enum',
    enum: PortalUserStatus,
    nullable: false,
    default: PortalUserStatus.FRESH
  })
    status!: PortalUserStatus

  @OneToMany(() => MerchantEntity, merchant => merchant.created_by)
    created_merchants!: MerchantEntity[]

  @OneToMany(() => MerchantEntity, merchant => merchant.checked_by)
    checked_merchants!: MerchantEntity[]

  @OneToMany(() => AuditEntity, audit => audit.portal_user)
    audits!: AuditEntity[]

  @ManyToMany(() => DFSPEntity, dfsp => dfsp.portal_users)
  @JoinTable()
    dfsps!: DFSPEntity[]

  @ManyToOne(() => PortalRoleEntity, role => role.users)
    role!: PortalRoleEntity

  // TODO: Role Based Permission etc. use Mojaloop OAuth? WSO2? Keycloak?
}
