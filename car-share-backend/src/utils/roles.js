const roles = ['passenger', 'driver', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getProfile', 'updateProfile', 'becomeDriver', 'getTrips', 'getTrip', 'createBooking', 'getBookings', 'getBooking', 'cancelBooking', 'rateBooking', 'getMessages', 'sendMessage']);
roleRights.set(roles[1], ['getProfile', 'updateProfile', 'getTrips', 'getTrip', 'createTrip', 'updateTrip', 'deleteTrip', 'getBookings', 'getBooking', 'cancelBooking', 'rateBooking', 'getMessages', 'sendMessage']);
roleRights.set(roles[2], ['getProfile', 'updateProfile', 'getTrips', 'getTrip', 'createTrip', 'updateTrip', 'deleteTrip', 'getBookings', 'getBooking', 'cancelBooking', 'getUsers', 'getUser', 'updateUser', 'getMessages', 'sendMessage']);

module.exports = {
  roles,
  roleRights,
};