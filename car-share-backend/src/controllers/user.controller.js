const httpStatus = require('http-status');
const { User, Vehicle } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get user profile
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Vehicle,
          as: 'vehicles',
          required: false,
        },
      ],
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    res.send(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phoneNumber, avatar, dateOfBirth, address, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if phone is already taken
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingPhone = await User.findOne({ where: { phoneNumber } });
      if (existingPhone) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already taken');
      }
    }

    // Update user
    const updatedUser = await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phoneNumber: phoneNumber || user.phoneNumber,
      avatar: avatar || user.avatar,
      dateOfBirth: dateOfBirth || user.dateOfBirth,
      email: email || user.email,
      address: address || user.address,
      // If phone is updated, mark as unverified
      isPhoneVerified: phoneNumber && phoneNumber !== user.phoneNumber ? false : user.isPhoneVerified,
      isEmailVerified: email && email !== user.email ? false : user.isEmailVerified,
    });

    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Become a driver
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const becomeDriver = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      make,
      model,
      year,
      licensePlate,
      color,
      type,
      seats,
      transmission,
      dailyRate,
      location,
      images,
      driverLicense
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (user.role === 'driver') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User is already a driver');
    }

    // Check if license plate is already taken
    const existingVehicle = await Vehicle.findOne({ where: { licensePlate } });
    if (existingVehicle) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'License plate already registered');
    }

    // Create vehicle
    const vehicle = await Vehicle.create({
      ownerId: userId,
      make,
      model,
      year,
      licensePlate,
      color,
      type,
      seats,
      transmission,
      dailyRate,
      location,
      images,
      verificationStatus: 'pending',
      availabilityStatus: 'available'
    });

    // Update user to driver role
    await user.update({
      role: 'driver',
      driverLicense,
      status: 'pending' // Require admin verification
    });

    res.status(httpStatus.CREATED).send({
      user: user.toJSON(),
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin only)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Vehicle,
          as: 'vehicles',
          required: false,
        },
      ],
    });

    res.send(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by id (admin only)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Vehicle,
          as: 'vehicles',
          required: false,
        },
      ],
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    res.send(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin only)
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object>}
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isEmailVerified, isPhoneVerified, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Update user
    const updatedUser = await user.update({
      role: role || user.role,
      isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : user.isEmailVerified,
      isPhoneVerified: isPhoneVerified !== undefined ? isPhoneVerified : user.isPhoneVerified,
      status: status || user.status
    });

    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  becomeDriver,
  getUsers,
  getUser,
  updateUser,
};