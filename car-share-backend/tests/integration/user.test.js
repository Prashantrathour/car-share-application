const request = require('supertest');
const httpStatus = require('http-status');
const { faker } = require('@faker-js/faker');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User, Driver } = require('../../src/models');
const { getAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('User routes', () => {
  describe('GET /v1/users/profile', () => {
    test('should return 200 and the user profile if data is ok', async () => {
      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      });

      const accessToken = await getAccessToken(user);

      const res = await request(app)
        .get('/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: 'passenger',
        profile_image: null,
        is_email_verified: false,
        is_phone_verified: false,
        driver_details: null,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      return request(app).get('/v1/users/profile').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /v1/users/profile', () => {
    test('should return 200 and successfully update user profile if data is ok', async () => {
      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      });

      const accessToken = await getAccessToken(user);
      const updateBody = {
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
        profile_image: faker.image.url(),
      };

      const res = await request(app)
        .patch('/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: user.id,
        email: user.email,
        name: updateBody.name,
        phone: updateBody.phone,
        role: 'passenger',
        profile_image: updateBody.profile_image,
        is_email_verified: false,
        is_phone_verified: false,
      });
    });

    test('should return 400 error if phone number is already taken', async () => {
      const user1 = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      });

      const user2 = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      });

      const accessToken = await getAccessToken(user1);
      const updateBody = {
        phone: user2.phone,
      };

      await request(app)
        .patch('/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/users/become-driver', () => {
    test('should return 201 and successfully register user as driver if data is ok', async () => {
      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      });

      const accessToken = await getAccessToken(user);
      const driverBody = {
        car_model: 'Toyota Camry',
        license_plate: 'ABC123',
        capacity: 4,
        license_image: faker.image.url(),
        car_image: faker.image.url(),
      };

      const res = await request(app)
        .post('/v1/users/become-driver')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(driverBody)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        user_id: user.id,
        car_model: driverBody.car_model,
        license_plate: driverBody.license_plate,
        capacity: driverBody.capacity,
        license_image: driverBody.license_image,
        car_image: driverBody.car_image,
      });

      const updatedUser = await User.findByPk(user.id);
      expect(updatedUser.role).toBe('driver');
    });

    test('should return 400 error if user is already a driver', async () => {
      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
        role: 'driver',
      });

      await Driver.create({
        user_id: user.id,
        car_model: 'Toyota Camry',
        license_plate: 'ABC123',
        capacity: 4,
      });

      const accessToken = await getAccessToken(user);
      const driverBody = {
        car_model: 'Honda Civic',
        license_plate: 'XYZ789',
        capacity: 4,
      };

      await request(app)
        .post('/v1/users/become-driver')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(driverBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/users', () => {
    test('should return 200 and apply filters correctly', async () => {
      const admin = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
        role: 'admin',
      });

      const accessToken = await getAccessToken(admin);

      // Create some test users
      const users = await Promise.all([
        User.create({
          email: faker.internet.email().toLowerCase(),
          password: 'password123',
          name: faker.person.fullName(),
          phone: faker.phone.number('+91##########'),
        }),
        User.create({
          email: faker.internet.email().toLowerCase(),
          password: 'password123',
          name: faker.person.fullName(),
          phone: faker.phone.number('+91##########'),
        }),
      ]);

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toHaveLength(3); // Including admin user
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            email: expect.any(String),
            name: expect.any(String),
            phone: expect.any(String),
            role: expect.any(String),
          }),
        ])
      );
    });

    test('should return 403 error if user is not admin', async () => {
      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      });

      const accessToken = await getAccessToken(user);

      await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /v1/users/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      const admin = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
        role: 'admin',
      });

      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      });

      const accessToken = await getAccessToken(admin);

      const res = await request(app)
        .get(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: 'passenger',
        profile_image: null,
        is_email_verified: false,
        is_phone_verified: false,
        driver_details: null,
      });
    });

    test('should return 404 error if user is not found', async () => {
      const admin = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
        role: 'admin',
      });

      const accessToken = await getAccessToken(admin);

      await request(app)
        .get(`/v1/users/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/users/:userId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      const admin = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
        role: 'admin',
      });

      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      });

      const accessToken = await getAccessToken(admin);
      const updateBody = {
        role: 'driver',
        is_email_verified: true,
        is_phone_verified: true,
      };

      const res = await request(app)
        .patch(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: updateBody.role,
        profile_image: null,
        is_email_verified: updateBody.is_email_verified,
        is_phone_verified: updateBody.is_phone_verified,
      });
    });

    test('should return 404 error if user is not found', async () => {
      const admin = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
        role: 'admin',
      });

      const accessToken = await getAccessToken(admin);
      const updateBody = {
        role: 'driver',
      };

      await request(app)
        .patch(`/v1/users/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
