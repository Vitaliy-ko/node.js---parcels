import * as faker from 'faker'
import { createConnection, getConnection } from 'typeorm'

async function runSeeder() {
    if (!(await createConnection())) {
        console.log('No database connection')
        process.exit()
    }
    console.log('Seeding...')

    let parcels = []
    for (let i = 0; i < 100000; i++) {
        const query =
            'insert into parcels(location,name,status,deliveryAddress) VALUES '

        const longitude =
            '' +
            faker.random.number({
                min: -180,
                max: 180,
                precision: 0.00001,
            })
        const latitude =
            '' +
            faker.random.number({
                min: -90,
                max: 90,
                precision: 0.00001,
            })

        const name = faker.random.word()
        const status = 'waiting'
        const deliveryAddress = faker.address.streetAddress()

        parcels.push(
            `(ST_GeomFromText("Point(${latitude} ${longitude})",4326), "${name}", "${status}", "${deliveryAddress}")`,
        )

        if (i % 500 === 0) {
            await getConnection().query(
                query + parcels.join(',\n') + ';',
            )
            parcels = []
        }
    }
}

runSeeder()
    .then(() => {
        console.log('done')
        process.exit()
    })
    .catch(err => {
        console.error(err.message)
        process.exit()
    })
