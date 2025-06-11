const express = require('express');
const configController = require('../controllers/config.controller');

const router = express.Router();

router.get('/firebase', configController.getFirebaseConfig);

module.exports = router; 