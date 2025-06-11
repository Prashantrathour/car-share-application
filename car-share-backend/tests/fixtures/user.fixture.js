const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const { User } = require('../../src/models');
const config = require('../../src/config/config');

const password = 'password123';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password: hashedPassword,
  role: 'passenger',
  profile_image: faker.image.avatar(),
  is_email_verified: true,
  status: 'active',
};

const userTwo = {
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password: hashedPassword,
  role: 'driver',
  profile_image: faker.image.avatar(),
  is_email_verified: true,
  status: 'active',
};

const insertUsers = async (users) => {
  await User.bulkCreate(users.map((user) => ({ ...user })));
};

module.exports = {
  userOne,
  userTwo,
  insertUsers,
}; 