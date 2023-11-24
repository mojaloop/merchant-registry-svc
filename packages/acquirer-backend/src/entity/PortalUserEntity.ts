import { Entity, Column, OneToMany, ManyToOne } from 'typeorm'
import { AuditEntity } from './AuditEntity'
import { MerchantEntity } from './MerchantEntity'
import { PortalUserStatus, PortalUserType } from 'shared-lib'
import { PersonEntity } from './PersonEntity'
import { DFSPEntity } from './DFSPEntity'
import { PortalRoleEntity } from './PortalRoleEntity'
import { EmailVerificationTokenEntity } from './EmailVerificationToken'
import { JwtTokenEntity } from './JwtTokenEntity'

@Entity('portal_users')
export class PortalUserEntity extends PersonEntity {
  // password hashed
  @Column({ nullable: true, length: 2048 })
    password!: string

  @Column({
    type: 'simple-enum',
    enum: PortalUserType,
    nullable: false
  })
    user_type!: PortalUserType

  @Column({
    type: 'simple-enum',
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

  @OneToMany(() => EmailVerificationTokenEntity, emailToken => emailToken.portal_user)
    email_verification_tokens!: EmailVerificationTokenEntity[]

  @ManyToOne(() => DFSPEntity, dfsp => dfsp.portal_users)
    dfsp!: DFSPEntity

  @ManyToOne(() => PortalRoleEntity, role => role.users)
    role!: PortalRoleEntity

  @OneToMany(() => JwtTokenEntity, jwtToken => jwtToken.user)
    tokens!: JwtTokenEntity[]
  // TODO: Role Based Permission etc. use Mojaloop OAuth? WSO2? Keycloak?
}
