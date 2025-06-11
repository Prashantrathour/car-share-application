const httpStatus = require('http-status');
const { Vehicle } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a vehicle
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Vehicle>}
 */
const createVehicle = async (req, res) => {
  const vehicle = await Vehicle.create({
    ...req.body,
    userId: req.user.id,
  });
  res.status(httpStatus.CREATED).send(vehicle);
};

/**
 * Get all vehicles
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Vehicle[]>}
 */
const getVehicles = async (req, res) => {
    const vehicles = await Vehicle.findAll({
      where: { ownerId: req.user.id },
    });
  res.send(vehicles);
};

/**
 * Get vehicle by id
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Vehicle>}
 */
const getVehicle = async (req, res) => {
  const vehicle = await Vehicle.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id,
    },
  });
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  res.send(vehicle);
};

/**
 * Update vehicle by id
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Vehicle>}
 */
const updateVehicle = async (req, res) => {
  const vehicle = await Vehicle.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id,
    },
  });
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  Object.assign(vehicle, req.body);
  await vehicle.save();
  res.send(vehicle);
};

/**
 * Delete vehicle by id
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<void>}
 */
const deleteVehicle = async (req, res) => {
  const vehicle = await Vehicle.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id,
    },
  });
  if (!vehicle) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }
  await vehicle.destroy();
  res.status(httpStatus.NO_CONTENT).send();
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
}; 