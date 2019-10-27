import { AuthChecker } from 'type-graphql'

export const authChecker: AuthChecker<any> = ({
    context,
}) => {
    return context.user != null
}
