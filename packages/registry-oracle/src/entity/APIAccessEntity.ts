import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, ManyToOne
} from 'typeorm'
import { DFSPEntity } from './DFSPEntity'

@Entity('api_access')
export class APIAccessEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false })
    client_secret!: string

  @ManyToOne(
    () => DFSPEntity,
    dfsp => dfsp.api_accesses
  )
    dfsp!: DFSPEntity

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
