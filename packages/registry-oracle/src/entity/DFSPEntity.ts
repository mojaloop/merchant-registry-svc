import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm'
import { APIAccessEntity } from './APIAccessEntity'

@Entity('dfsp')
export class DFSPEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false })
    fspId!: string

  @Column({ nullable: false })
    dfsp_name!: string

  @OneToMany(
    () => APIAccessEntity,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    api_access => api_access.dfsp
  )
    api_accesses!: APIAccessEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
