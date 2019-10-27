import { Field, ObjectType, Int } from 'type-graphql'
import { LocationGQL } from './LocationGQL'

@ObjectType('Parcel')
export class ParcelGQL {
    @Field(type => Int)
    id: number

    @Field()
    name: string

    @Field()
    status: string

    @Field()
    deliveryAddress: string

    @Field(type => LocationGQL)
    location: LocationGQL
}
