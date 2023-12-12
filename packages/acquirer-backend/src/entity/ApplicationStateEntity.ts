import {
  Entity,
  Column, PrimaryGeneratedColumn
} from 'typeorm'

@Entity('application_state')
export class ApplicationStateEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'boolean', default: false })
    is_hub_onboarding_complete!: boolean
}
