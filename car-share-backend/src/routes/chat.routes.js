const express = require('express');
const { body, query } = require('express-validator');
const validate = require('../middlewares/validate');
const chatController = require('../controllers/chat.controller');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get(
  '/:tripId',
  auth(),
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('Must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Must be between 1 and 100'),
  ]),
  chatController.getTripMessages
);

router.post(
  '/:tripId',
  auth(),
  validate([
    body('content').notEmpty().withMessage('Message content is required'),
  ]),
  chatController.sendMessage
);

module.exports = router; 