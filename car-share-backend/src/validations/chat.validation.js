const { body } = require('express-validator');

const sendMessage = [
  body('content').notEmpty().withMessage('Message content is required'),
];

module.exports = {
  sendMessage,
};