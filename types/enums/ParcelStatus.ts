import { registerEnumType } from 'type-graphql'

export enum Status {
    waiting,
    assigned,
    pickedUp,
    delivered,
}

registerEnumType(Status, {
    name: 'Status',
    description: 'Parcel status',
})
