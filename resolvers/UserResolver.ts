import { UserEntity } from './../entities/UserEntity'
import {
    Resolver,
    Arg,
    Mutation,
    Query,
} from 'type-graphql'
import { UserGQL } from '../types/UserGQL'
import { UserInputGQL } from '../types/UserInputGQL'
import * as bcrypt from 'bcrypt'
import * as faker from 'faker'
import * as jwt from 'jsonwebtoken'
import { SECRET } from '../config'
import { ApolloError } from 'apollo-server'

@Resolver(type => UserGQL)
export class UserResolver {
    @Mutation(returns => UserGQL)
    async signUp(
        @Arg('data', type => UserInputGQL)
        data: UserInputGQL,
    ) {
        const user = new UserEntity()
        user.email = data.email
        user.password = bcrypt.hashSync(data.password, 10)
        user.fullName =
            faker.name.firstName() +
            ' ' +
            faker.name.lastName()
        await user.save()

        user.token = this.getJWTToken(user)
        return user
    }

    @Mutation(returns => UserGQL)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
    ) {
        const user = await UserEntity.findOneOrFail({
            where: { email },
        })

        if (!bcrypt.compareSync(password, user.password)) {
            throw new ApolloError(
                'Wrong email or password',
                'WRONG_CREDENTIALS',
            )
        }

        user.token = this.getJWTToken(user)
        return user
    }

    getJWTToken(user: UserEntity): string {
        return jwt.sign(
            {
                data: { id: user.id },
            },
            SECRET,
            {
                expiresIn: `10 days`,
            },
        )
    }
}
