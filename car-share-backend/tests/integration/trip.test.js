const request = require('supertest');
const httpStatus = require('http-status');
const { faker } = require('@faker-js/faker');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Trip, User, Driver } = require('../../src/models');
const { getAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Trip routes', () => {
  let driverUser;
  let passengerUser;
  let driverToken;
  let passengerToken;
  let driver;

  beforeEach(async () => {
    // Create driver user
    driverUser = await User.create({
      email: faker.internet.email().toLowerCase(),
      password: 'password123',
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      role: 'driver',
    });

    // Create driver profile
    driver = await Driver.create({
      user_id: driverUser.id,
      car_model: faker.vehicle.model(),
      license_plate: faker.vehicle.vrm(),
      capacity: 4,
    });

    // Create passenger user
    passengerUser = await User.create({
      email: faker.internet.email().toLowerCase(),
      password: 'password123',
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      role: 'passenger',
    });

    // Get access tokens
    driverToken = await getAccessToken(driverUser.email, 'password123');
    passengerToken = await getAccessToken(passengerUser.email, 'password123');
  });

  describe('POST /v1/trips', () => {
    test('should return 201 and successfully create trip if data is ok', async () => {
      const tripData = {
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
        description: faker.lorem.sentence(),
        pickup_location: faker.location.streetAddress(),
        dropoff_location: faker.location.streetAddress(),
      };

      const res = await request(app)
        .post('/v1/trips')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(tripData)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        driver_id: driverUser.id,
        departure_city: tripData.departure_city,
        destination_city: tripData.destination_city,
        departure_time: tripData.departure_time,
        seats: tripData.seats,
        available_seats: tripData.seats,
        price: tripData.price,
        description: tripData.description,
        pickup_location: tripData.pickup_location,
        dropoff_location: tripData.dropoff_location,
        status: 'scheduled',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });

      const dbTrip = await Trip.findByPk(res.body.id);
      expect(dbTrip).toBeDefined();
      expect(dbTrip.driver_id).toBe(driverUser.id);
    });

    test('should return 403 error if user is not a driver', async () => {
      const tripData = {
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
      };

      await request(app)
        .post('/v1/trips')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(tripData)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if departure time is in the past', async () => {
      const tripData = {
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.past(),
        seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
      };

      await request(app)
        .post('/v1/trips')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(tripData)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if seats is less than 1', async () => {
      const tripData = {
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 0,
        price: faker.number.int({ min: 10, max: 100 }),
      };

      await request(app)
        .post('/v1/trips')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(tripData)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/trips', () => {
    test('should return 200 and apply filters correctly', async () => {
      // Create multiple trips
      const trips = await Promise.all([
        Trip.create({
          driver_id: driverUser.id,
          departure_city: 'New York',
          destination_city: 'Boston',
          departure_time: faker.date.future(),
          seats: 3,
          available_seats: 3,
          price: 50,
        }),
        Trip.create({
          driver_id: driverUser.id,
          departure_city: 'Boston',
          destination_city: 'New York',
          departure_time: faker.date.future(),
          seats: 4,
          available_seats: 4,
          price: 60,
        }),
      ]);

      const res = await request(app)
        .get('/v1/trips')
        .query({ departure_city: 'New York', min_seats: 3 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        trips: expect.any(Array),
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      });

      expect(res.body.trips).toHaveLength(1);
      expect(res.body.trips[0].id).toBe(trips[0].id);
    });

    test('should return 200 and apply pagination correctly', async () => {
      // Create multiple trips
      await Promise.all(
        Array(15)
          .fill()
          .map(() =>
            Trip.create({
              driver_id: driverUser.id,
              departure_city: faker.location.city(),
              destination_city: faker.location.city(),
              departure_time: faker.date.future(),
              seats: 3,
              available_seats: 3,
              price: faker.number.int({ min: 10, max: 100 }),
            })
          )
      );

      const res = await request(app)
        .get('/v1/trips')
        .query({ page: 2, limit: 10 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        trips: expect.any(Array),
        pagination: {
          total: 15,
          page: 2,
          limit: 10,
          pages: 2,
        },
      });

      expect(res.body.trips).toHaveLength(5);
    });
  });

  describe('GET /v1/trips/:id', () => {
    test('should return 200 and the trip object if data is ok', async () => {
      const trip = await Trip.create({
        driver_id: driverUser.id,
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        available_seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
      });

      const res = await request(app)
        .get(`/v1/trips/${trip.id}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: trip.id,
        driver_id: trip.driver_id,
        departure_city: trip.departure_city,
        destination_city: trip.destination_city,
        departure_time: trip.departure_time,
        seats: trip.seats,
        available_seats: trip.available_seats,
        price: trip.price,
        status: trip.status,
        driver: expect.any(Object),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    test('should return 404 error if trip is not found', async () => {
      await request(app)
        .get(`/v1/trips/${faker.string.uuid()}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/trips/:id', () => {
    test('should return 200 and successfully update trip if data is ok', async () => {
      const trip = await Trip.create({
        driver_id: driverUser.id,
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        available_seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
      });

      const updateBody = {
        price: 75,
        description: 'Updated description',
      };

      const res = await request(app)
        .patch(`/v1/trips/${trip.id}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: trip.id,
        driver_id: trip.driver_id,
        departure_city: trip.departure_city,
        destination_city: trip.destination_city,
        departure_time: trip.departure_time,
        seats: trip.seats,
        available_seats: trip.available_seats,
        price: updateBody.price,
        description: updateBody.description,
        status: trip.status,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });

      const dbTrip = await Trip.findByPk(trip.id);
      expect(dbTrip).toBeDefined();
      expect(dbTrip.price).toBe(updateBody.price);
      expect(dbTrip.description).toBe(updateBody.description);
    });

    test('should return 404 error if trip is not found', async () => {
      const updateBody = {
        price: 75,
      };

      await request(app)
        .patch(`/v1/trips/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 403 error if user is not the driver', async () => {
      const trip = await Trip.create({
        driver_id: driverUser.id,
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        available_seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
      });

      const updateBody = {
        price: 75,
      };

      await request(app)
        .patch(`/v1/trips/${trip.id}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if trying to update completed trip', async () => {
      const trip = await Trip.create({
        driver_id: driverUser.id,
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        available_seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
        status: 'completed',
      });

      const updateBody = {
        price: 75,
      };

      await request(app)
        .patch(`/v1/trips/${trip.id}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/trips/:id', () => {
    test('should return 204 if data is ok', async () => {
      const trip = await Trip.create({
        driver_id: driverUser.id,
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        available_seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
      });

      await request(app)
        .delete(`/v1/trips/${trip.id}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbTrip = await Trip.findByPk(trip.id);
      expect(dbTrip).toBeNull();
    });

    test('should return 404 error if trip is not found', async () => {
      await request(app)
        .delete(`/v1/trips/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 403 error if user is not the driver', async () => {
      const trip = await Trip.create({
        driver_id: driverUser.id,
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        available_seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
      });

      await request(app)
        .delete(`/v1/trips/${trip.id}`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should mark trip as cancelled if it has bookings', async () => {
      const trip = await Trip.create({
        driver_id: driverUser.id,
        departure_city: faker.location.city(),
        destination_city: faker.location.city(),
        departure_time: faker.date.future(),
        seats: 3,
        available_seats: 3,
        price: faker.number.int({ min: 10, max: 100 }),
      });

      // Create a booking for the trip
      await Booking.create({
        tripId: trip.id,
        passenger_id: passengerUser.id,
        seats_booked: 1,
        amount: trip.price,
        status: 'pending',
      });

      const res = await request(app)
        .delete(`/v1/trips/${trip.id}`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        message: 'Trip cancelled successfully',
      });

      const dbTrip = await Trip.findByPk(trip.id);
      expect(dbTrip).toBeDefined();
      expect(dbTrip.status).toBe('cancelled');
    });
  });
});
