const request = require('supertest');
const httpStatus = require('http-status');
const { faker } = require('@faker-js/faker');
const app = require('../../src/app');
const { User } = require('../../src/models');
const { userOne, insertUsers } = require('../fixtures/user.fixture');
const { getAccessToken } = require('../fixtures/token.fixture');

describe('Auth routes', () => {
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /v1/auth/register', () => {
    test('should return 201 and successfully register user if data is ok', async () => {
      const newUser = {
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
        role: 'passenger',
      };

      const res = await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        user: {
          id: expect.any(Number),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          is_email_verified: false,
          is_phone_verified: false,
        },
        tokens: {
          access: {
            token: expect.any(String),
            expires: expect.any(String),
          },
          refresh: {
            token: expect.any(String),
            expires: expect.any(String),
          },
        },
      });

      const dbUser = await User.findByPk(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      });
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      const newUser = {
        email: userOne.email,
        password: 'password123',
        name: faker.person.fullName(),
        phone: faker.phone.number('+91##########'),
      };

      const res = await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        message: 'Email already taken',
      });
    });

    test('should return 400 error if phone is already used', async () => {
      await insertUsers([userOne]);
      const newUser = {
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        name: faker.person.fullName(),
        phone: userOne.phone,
      };

      const res = await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        message: 'Phone number already taken',
      });
    });
  });

  describe('POST /v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        user: {
          id: expect.any(Number),
          email: userOne.email,
          name: userOne.name,
          role: userOne.role,
          is_email_verified: userOne.is_email_verified,
          is_phone_verified: userOne.is_phone_verified,
        },
        tokens: {
          access: {
            token: expect.any(String),
            expires: expect.any(String),
          },
          refresh: {
            token: expect.any(String),
            expires: expect.any(String),
          },
        },
      });
    });

    test('should return 401 error if there are no users with that email', async () => {
      const loginCredentials = {
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: 'Incorrect email or password',
      });
    });

    test('should return 401 error if password is wrong', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: 'wrongPassword',
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: 'Incorrect email or password',
      });
    });
  });

  describe('POST /v1/auth/refresh-token', () => {
    test('should return 200 and new access token if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const refreshToken = await getAccessToken(userOne, false);
      const res = await request(app)
        .post('/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        tokens: {
          access: {
            token: expect.any(String),
            expires: expect.any(String),
          },
          refresh: {
            token: expect.any(String),
            expires: expect.any(String),
          },
        },
      });
    });

    test('should return 401 error if refresh token is invalid', async () => {
      const res = await request(app)
        .post('/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    });
  });

  describe('POST /v1/auth/logout', () => {
    test('should return 204 and clear refresh token if user is logged in', async () => {
      await insertUsers([userOne]);
      const accessToken = await getAccessToken(userOne);
      const res = await request(app)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findByPk(userOne.id);
      expect(dbUser.refresh_token).toBeNull();
    });

    test('should return 401 error if user is not logged in', async () => {
      const res = await request(app)
        .post('/v1/auth/logout')
        .send()
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: 'Please authenticate',
      });
    });
  });

  describe('POST /v1/auth/verify-email', () => {
    test('should return 200 and verify email if token is valid', async () => {
      await insertUsers([userOne]);
      const res = await request(app)
        .post('/v1/auth/verify-email')
        .send({ token: userOne.email_verification_token })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        message: 'Email verified successfully',
      });

      const dbUser = await User.findByPk(userOne.id);
      expect(dbUser.is_email_verified).toBe(true);
      expect(dbUser.email_verification_token).toBeNull();
    });

    test('should return 400 error if token is invalid', async () => {
      const res = await request(app)
        .post('/v1/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        message: 'Invalid verification token',
      });
    });
  });

  describe('POST /v1/auth/verify-phone', () => {
    test('should return 200 and verify phone if code is valid', async () => {
      await insertUsers([userOne]);
      const res = await request(app)
        .post('/v1/auth/verify-phone')
        .send({
          phone: userOne.phone,
          code: userOne.phone_verification_code,
        })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        message: 'Phone verified successfully',
      });

      const dbUser = await User.findByPk(userOne.id);
      expect(dbUser.is_phone_verified).toBe(true);
      expect(dbUser.phone_verification_code).toBeNull();
    });

    test('should return 400 error if code is invalid', async () => {
      const res = await request(app)
        .post('/v1/auth/verify-phone')
        .send({
          phone: userOne.phone,
          code: '000000',
        })
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        message: 'Invalid verification code',
      });
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    test('should return 200 and send reset password email if email exists', async () => {
      await insertUsers([userOne]);
      const res = await request(app)
        .post('/v1/auth/forgot-password')
        .send({ email: userOne.email })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        message: 'Password reset email sent',
      });

      const dbUser = await User.findByPk(userOne.id);
      expect(dbUser.reset_password_token).toBeDefined();
      expect(dbUser.reset_password_expires).toBeDefined();
    });

    test('should return 404 error if email does not exist', async () => {
      const res = await request(app)
        .post('/v1/auth/forgot-password')
        .send({ email: faker.internet.email().toLowerCase() })
        .expect(httpStatus.NOT_FOUND);

      expect(res.body).toEqual({
        code: httpStatus.NOT_FOUND,
        message: 'No user found with this email',
      });
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    test('should return 200 and reset password if token is valid', async () => {
      await insertUsers([userOne]);
      const resetToken = await userOne.generateResetPasswordToken();
      await userOne.save();

      const newPassword = 'newPassword123';
      const res = await request(app)
        .post('/v1/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
        })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        message: 'Password reset successfully',
      });

      const dbUser = await User.findByPk(userOne.id);
      expect(dbUser.reset_password_token).toBeNull();
      expect(dbUser.reset_password_expires).toBeNull();
      expect(await dbUser.isPasswordMatch(newPassword)).toBe(true);
    });

    test('should return 400 error if token is invalid', async () => {
      const res = await request(app)
        .post('/v1/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newPassword123',
        })
        .expect(httpStatus.BAD_REQUEST);

      expect(res.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        message: 'Invalid or expired reset token',
      });
    });
  });
});
