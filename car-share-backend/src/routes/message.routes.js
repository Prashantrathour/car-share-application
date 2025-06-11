const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const messageController = require('../controllers/message.controller');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get(
  '/:tripId',
  auth(),
  messageController.getMessages
);

router.post(
  '/:tripId',
  auth(),
  validate([
    body('content').notEmpty().withMessage('Message content is required'),
  ]),
  messageController.sendMessage
);

router.patch(
  '/:tripId/read',
  auth(),
  messageController.markAsRead
);

module.exports = router;