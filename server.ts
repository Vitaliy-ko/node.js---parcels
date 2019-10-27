import { ParcelResolver } from './resolvers/ParcelResolver'
import { UserResolver } from './resolvers/UserResolver'
import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { authChecker } from './types/authChecker'
import * as jwt from 'jsonwebtoken'
import { SECRET } from './config'

async function startServer() {
    await createConnection()
    const schema = await buildSchema({
        resolvers: [UserResolver, ParcelResolver],
        authChecker,
    })
    const server = new ApolloServer({
        schema,
        playground: true,
        context: (session: any) => {
            if (!session.req) return {}

            let user = null
            let token = session.req.headers.authorization

            if (token) {
                token = token.slice(7, token.length)
                if (jwt.verify(token, SECRET)) {
                    const data = jwt.decode(token)
                    user = data.data
                }
            }

            return { user, session }
        },
    })
    server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`)
    })
}
startServer().catch(error => {
    console.log(error)
})
