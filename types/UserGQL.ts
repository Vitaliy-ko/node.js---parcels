import {
    Field,
    InputType,
    Int,
    ObjectType,
} from 'type-graphql'
import { ParcelGQL } from './ParcelGQL'

@ObjectType('User')
export class UserGQL {
    @Field(type => Int)
    id: number
    @Field()
    fullName: string

    @Field()
    token: string

    @Field(type => ParcelGQL, { nullable: true })
    parcel: ParcelGQL
}
