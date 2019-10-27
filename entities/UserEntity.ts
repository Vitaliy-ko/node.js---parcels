import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
} from 'typeorm'
import { ParcelEntity } from './ParcelEntity'

@Entity('user')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    fullName: string

    @Column()
    email: string

    @Column()
    password: string

    @OneToOne(type => ParcelEntity, parcel => parcel.user)
    parcel: ParcelEntity

    token: string
}
