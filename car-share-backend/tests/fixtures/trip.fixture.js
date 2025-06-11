const { faker } = require('@faker-js/faker');
const { Trip } = require('../../src/models');

const tripOne = {
  id: faker.string.uuid(),
  driver_id: faker.string.uuid(), // Will be set when inserting users
  departure_city: faker.location.city(),
  destination_city: faker.location.city(),
  departure_time: faker.date.future(),
  estimated_arrival_time: faker.date.future(),
  seats: 4,
  available_seats: 4,
  price: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
  status: 'scheduled',
  description: faker.lorem.sentence(),
  pickup_location: faker.location.streetAddress(),
  dropoff_location: faker.location.streetAddress(),
};

const insertTrips = async (trips) => {
  await Trip.bulkCreate(trips.map((trip) => ({ ...trip })));
};

module.exports = {
  tripOne,
  insertTrips,
}; 