const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes using direct object references to prevent "undefined" crashes
router.get('/', authMiddleware.protect, authMiddleware.requireRole(['Admin']), userController.getAllUsers);
router.delete('/:id', authMiddleware.protect, authMiddleware.requireRole(['Admin']), userController.deleteUser); 

module.exports = router;