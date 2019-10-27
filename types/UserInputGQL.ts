import { InputType, Field } from 'type-graphql'

@InputType('UserInput')
export class UserInputGQL {
    @Field()
    email: string

    @Field()
    password: string
}
