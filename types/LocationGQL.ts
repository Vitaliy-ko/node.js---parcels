import { Field, ObjectType, Float } from 'type-graphql'

@ObjectType('Location')
export class LocationGQL {
    @Field(type => Float)
    latitude: number

    @Field(type => Float)
    longitude: number
}
