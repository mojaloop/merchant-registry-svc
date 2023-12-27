import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { PortalUserEntity } from './PortalUserEntity'

@Entity('jwt_tokens')
export class JwtTokenEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @ManyToOne(() => PortalUserEntity, user => user.tokens, { onDelete: 'CASCADE' })
    user!: PortalUserEntity

  @Column({
    type: 'varchar',
    length: 512
  })
    token!: string

  @CreateDateColumn()
    issued_at!: Date

  @Column('datetime')
    expires_at!: Date

  @UpdateDateColumn()
    last_used!: Date
}
