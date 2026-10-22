const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Anyone logged in can see the user directory
router.get('/', verifyToken, userController.getAllUsers);

module.exports = router;