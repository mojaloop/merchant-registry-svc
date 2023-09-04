import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, ManyToOne
} from 'typeorm'
import { PortalUserEntity } from './PortalUserEntity'

@Entity('email_verification_tokens')
export class EmailVerificationTokenEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255, unique: true })
    token!: string

  @Column({ nullable: false, length: 255 })
    email!: string

  @Column({ nullable: false, default: false })
    is_used!: boolean

  @Column({ nullable: true })
    expires_at!: Date

  @ManyToOne(() => PortalUserEntity, portalUser => portalUser.email_verification_tokens)
    portal_user!: PortalUserEntity

  @CreateDateColumn()
    created_at!: Date
}
