import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    Index,
    JoinColumn,
} from 'typeorm'
import { UserEntity } from './UserEntity'

@Entity('parcels')
export class ParcelEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({
        type: 'enum',
        enum: [
            'waiting',
            'assigned',
            'picked_up',
            'delivered',
        ],
    })
    status: string

    @Column()
    deliveryAddress: string

    @Column({
        type: 'point',
    })
    @Index({ spatial: true })
    location: string

    @OneToOne(type => UserEntity, user => user.parcel)
    @JoinColumn()
    user: UserEntity
}
