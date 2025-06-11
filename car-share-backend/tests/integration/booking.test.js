const request = require('supertest');
const httpStatus = require('http-status');
const { faker } = require('@faker-js/faker');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Trip, User, Booking } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { tripOne, insertTrips } = require('../fixtures/trip.fixture');
const { getAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Booking routes', () => {
  describe('POST /v1/bookings', () => {
    test('should return 201 and successfully create booking if data is ok', async () => {
      // Insert test data
      await insertUsers([userOne, userTwo]);
      await insertTrips([tripOne]);

      const accessToken = await getAccessToken(userOne);
      const newBooking = {
        tripId: tripOne.id,
        seats_booked: 1,
      };

      const res = await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBooking)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        tripId: newBooking.tripId,
        passenger_id: userOne.id,
        seats_booked: newBooking.seats_booked,
        amount: expect.anything(),
        payment_status: 'pending',
        status: 'pending',
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbBooking = await Booking.findByPk(res.body.id);
      expect(dbBooking).toBeDefined();
      expect(dbBooking).toMatchObject({
        tripId: newBooking.tripId,
        passenger_id: userOne.id,
        seats_booked: newBooking.seats_booked,
      });
    });

    test('should return 400 error if trip is not found', async () => {
      await insertUsers([userOne]);
      const accessToken = await getAccessToken(userOne);
      const newBooking = {
        tripId: faker.string.uuid(),
        seats_booked: 1,
      };

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBooking)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if not enough seats available', async () => {
      await insertUsers([userOne]);
      await insertTrips([tripOne]);
      const accessToken = await getAccessToken(userOne);
      const newBooking = {
        tripId: tripOne.id,
        seats_booked: tripOne.available_seats + 1,
      };

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBooking)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/bookings').send({}).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/bookings', () => {
    test('should return 200 and apply filters correctly', async () => {
      await insertUsers([userOne, userTwo]);
      await insertTrips([tripOne]);
      const accessToken = await getAccessToken(userOne);

      const res = await request(app)
        .get('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual([]);
    });

    test('should return 200 and the booking object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertTrips([tripOne]);
      const accessToken = await getAccessToken(userOne);

      // Create a booking first
      const newBooking = {
        tripId: tripOne.id,
        seats_booked: 1,
      };

      await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBooking);

      const res = await request(app)
        .get('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toEqual({
        id: expect.anything(),
        tripId: tripOne.id,
        passenger_id: userOne.id,
        seats_booked: 1,
        amount: expect.anything(),
        payment_status: 'pending',
        status: 'pending',
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        trip: expect.anything(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get('/v1/bookings').expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/bookings/:id', () => {
    test('should return 200 and the booking object if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertTrips([tripOne]);
      const accessToken = await getAccessToken(userOne);

      // Create a booking first
      const newBooking = {
        tripId: tripOne.id,
        seats_booked: 1,
      };

      const createRes = await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBooking);

      const res = await request(app)
        .get(`/v1/bookings/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: createRes.body.id,
        tripId: tripOne.id,
        passenger_id: userOne.id,
        seats_booked: 1,
        amount: expect.anything(),
        payment_status: 'pending',
        status: 'pending',
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        trip: expect.anything(),
        passenger: expect.anything(),
      });
    });

    test('should return 404 error if booking is not found', async () => {
      await insertUsers([userOne]);
      const accessToken = await getAccessToken(userOne);

      await request(app)
        .get(`/v1/bookings/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/bookings/${faker.string.uuid()}`).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /v1/bookings/:id/cancel', () => {
    test('should return 200 and successfully cancel booking if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertTrips([tripOne]);
      const accessToken = await getAccessToken(userOne);

      // Create a booking first
      const newBooking = {
        tripId: tripOne.id,
        seats_booked: 1,
      };

      const createRes = await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBooking);

      const res = await request(app)
        .patch(`/v1/bookings/${createRes.body.id}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ cancellation_reason: 'Changed plans' })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: createRes.body.id,
        tripId: tripOne.id,
        passenger_id: userOne.id,
        seats_booked: 1,
        amount: expect.anything(),
        payment_status: 'pending',
        status: 'cancelled',
        cancellation_reason: 'Changed plans',
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbBooking = await Booking.findByPk(res.body.id);
      expect(dbBooking).toBeDefined();
      expect(dbBooking.status).toBe('cancelled');
      expect(dbBooking.cancellation_reason).toBe('Changed plans');
    });

    test('should return 404 error if booking is not found', async () => {
      await insertUsers([userOne]);
      const accessToken = await getAccessToken(userOne);

      await request(app)
        .patch(`/v1/bookings/${faker.string.uuid()}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ cancellation_reason: 'Changed plans' })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .patch(`/v1/bookings/${faker.string.uuid()}/cancel`)
        .send({ cancellation_reason: 'Changed plans' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /v1/bookings/:id/rate', () => {
    test('should return 200 and successfully rate booking if data is ok', async () => {
      await insertUsers([userOne, userTwo]);
      await insertTrips([tripOne]);
      const accessToken = await getAccessToken(userOne);

      // Create a booking first
      const newBooking = {
        tripId: tripOne.id,
        seats_booked: 1,
      };

      const createRes = await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBooking);

      // Update booking status to completed
      await Booking.update(
        { status: 'completed' },
        { where: { id: createRes.body.id } }
      );

      const res = await request(app)
        .patch(`/v1/bookings/${createRes.body.id}/rate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 5, comment: 'Great trip!' })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: createRes.body.id,
        tripId: tripOne.id,
        passenger_id: userOne.id,
        seats_booked: 1,
        amount: expect.anything(),
        payment_status: 'pending',
        status: 'completed',
        driver_rating: 5,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbBooking = await Booking.findByPk(res.body.id);
      expect(dbBooking).toBeDefined();
      expect(dbBooking.driver_rating).toBe(5);
    });

    test('should return 404 error if booking is not found', async () => {
      await insertUsers([userOne]);
      const accessToken = await getAccessToken(userOne);

      await request(app)
        .patch(`/v1/bookings/${faker.string.uuid()}/rate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 5, comment: 'Great trip!' })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if booking is not completed', async () => {
      await insertUsers([userOne, userTwo]);
      await insertTrips([tripOne]);
      const accessToken = await getAccessToken(userOne);

      // Create a booking first
      const newBooking = {
        tripId: tripOne.id,
        seats_booked: 1,
      };

      const createRes = await request(app)
        .post('/v1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newBooking);

      await request(app)
        .patch(`/v1/bookings/${createRes.body.id}/rate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 5, comment: 'Great trip!' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app)
        .patch(`/v1/bookings/${faker.string.uuid()}/rate`)
        .send({ rating: 5, comment: 'Great trip!' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
