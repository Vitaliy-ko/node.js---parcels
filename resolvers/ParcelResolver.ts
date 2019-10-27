import { ParcelEntity } from './../entities/ParcelEntity'
import {
    Resolver,
    Arg,
    Mutation,
    Ctx,
    Authorized,
    Query,
} from 'type-graphql'
import { ParcelGQL } from '../types/ParcelGQL'
import { Context } from '../Interfaces/Context'
import { UserEntity } from '../entities/UserEntity'
import { createQueryBuilder } from 'typeorm'
import { LocationInputGQL } from '../types/LocationInputGQL'

@Resolver(type => ParcelGQL)
export class ParcelResolver {
    @Mutation(returns => ParcelGQL)
    @Authorized()
    async assignParcel(
        @Arg('parcelId') parcelId: number,
        @Ctx() context: Context,
    ) {
        const parcelData = await this.getRawParcelData(
            parcelId,
        )

        if (parcelData.userId) {
            throw new Error(
                'The parcel has been already assigned',
            )
        }
        if (parcelData.status !== 'waiting') {
            throw new Error(
                'The parcel has no waiting status',
            )
        }
        parcelData.status = 'assigned'
        try {
            await createQueryBuilder(ParcelEntity)
                .update()
                .set({
                    status: 'assigned',
                    user: context.user.id,
                })
                .where('id = :id', { id: parcelId })
                .execute()
        } catch (error) {
            throw error
        }

        const parcel = this.getParcel(parcelData)
        return parcel
    }

    @Mutation(returns => ParcelGQL)
    @Authorized()
    async pickParcel(
        @Arg('parcelId') parcelId: number,
        @Ctx() context: Context,
    ) {
        const parcelData = await this.getRawParcelData(
            parcelId,
        )

        if (parcelData.userId !== context.user.id) {
            throw new Error(
                'This parcel  has not been assigned to current user',
            )
        }
        if (parcelData.status !== 'assigned') {
            throw new Error(
                'The parcel has no assigned status',
            )
        }
        parcelData.status = 'picked_up'

        try {
            await this.updateParcelStatus(
                parcelId,
                parcelData.status,
            )
        } catch (error) {
            throw error
        }

        const parcel = this.getParcel(parcelData)
        return parcel
    }

    @Mutation(returns => ParcelGQL)
    @Authorized()
    async deliverParcel(
        @Arg('parcelId') parcelId: number,
        @Ctx() context: Context,
    ) {
        const parcelData = await this.getRawParcelData(
            parcelId,
        )

        if (parcelData.userId !== context.user.id) {
            throw new Error(
                'This parcel has not been picked up by current user',
            )
        }
        if (parcelData.status !== 'picked_up') {
            throw new Error(
                'The parcel has no picked up status',
            )
        }
        parcelData.status = 'delivered'

        try {
            await this.updateParcelStatus(
                parcelId,
                parcelData.status,
            )
        } catch (error) {
            throw error
        }
        const parcel = this.getParcel(parcelData)
        return parcel
    }

    @Query(returns => [ParcelGQL])
    @Authorized()
    async getNearByParcels(
        @Arg('location', type => LocationInputGQL)
        location: LocationInputGQL,
        @Arg('radius') radius: number,
    ) {
        const parcels = []
        const EarthRadius = 6371000
        const longitude = location.longitude
        const latitude = location.latitude
        const deltaLat = this.toGrad(radius / EarthRadius)
        const deltaLon = this.toGrad(
            radius /
                (EarthRadius *
                    Math.cos(this.toRad(latitude))),
        )
        const polygon = `POLYGON((
          ${latitude - deltaLat} ${longitude - deltaLon},
          ${latitude + deltaLat} ${longitude - deltaLon} ,
          ${latitude + deltaLat} ${longitude + deltaLon} ,
          ${latitude - deltaLat} ${longitude + deltaLon} ,
          ${latitude - deltaLat} ${longitude - deltaLon}  
        ))`

        const parcelsData = await createQueryBuilder(
            ParcelEntity,
        )
            .select(
                `ST_Distance(location, ST_SRID(Point(${longitude},${latitude}),4326),"metre") as distance`,
            )
            .addSelect('ST_ASTEXT(location) as location')
            .addSelect([
                'ParcelEntity.id',
                'ParcelEntity.name',
                'ParcelEntity.status',
                'ParcelEntity.deliveryAddress',
            ])
            .where(
                `ST_CONTAINS(ST_GEOMFROMTEXT("${polygon}",4326),location)`,
            )
            .having(`distance < ${radius}`)
            .orderBy('distance', 'ASC')
            .getRawMany()

        for (const parcelData of parcelsData) {
            const parcel: ParcelGQL = {
                id: parcelData.ParcelEntity_id,
                name: parcelData.ParcelEntity_name,
                status: parcelData.ParcelEntity_status,
                deliveryAddress:
                    parcelData.ParcelEntity_deliveryAddress,
                location: this.getLocation(
                    parcelData.location,
                ),
            }
            parcels.push(parcel)
        }

        return parcels
    }

    toRad(grad: number): number {
        return (grad / 180) * Math.PI
    }
    toGrad(rad: number): number {
        return (rad / (2 * Math.PI)) * 360
    }

    getLocation(rawLocation) {
        const coordinates = rawLocation.match(/\d+\.\d*/g)
        const longitude = coordinates[0]
        const latitude = coordinates[1]
        return {
            longitude,
            latitude,
        }
    }

    getParcel(parcelData: any): ParcelGQL {
        const coordinates = parcelData.location.match(
            /\d+\.\d*/g,
        )
        const longitude = coordinates[0]
        const latitude = coordinates[1]

        const parcel: ParcelGQL = {
            id: parcelData.id,
            name: parcelData.name,
            status: parcelData.status,
            deliveryAddress: parcelData.deliveryAddress,
            location: {
                longitude,
                latitude,
            },
        }
        return parcel
    }

    getRawParcelData(parcelId) {
        return createQueryBuilder(ParcelEntity)
            .select('*')
            .addSelect('ST_ASTEXT(location) as location')
            .where('id = :id', { id: parcelId })
            .getRawOne()
    }

    updateParcelStatus(parcelId, newStatus) {
        return createQueryBuilder(ParcelEntity)
            .update()
            .set({
                status: newStatus,
            })
            .where('id = :id', { id: parcelId })
            .execute()
    }
}
