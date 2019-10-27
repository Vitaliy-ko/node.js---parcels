import { Field, InputType, Float } from 'type-graphql'

@InputType('LocationInput')
export class LocationInputGQL {
    @Field(type => Float)
    latitude: number

    @Field(type => Float)
    longitude: number
}
