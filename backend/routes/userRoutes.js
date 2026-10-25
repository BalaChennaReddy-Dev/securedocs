const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Make sure BOTH of these lines exist!
router.get('/', protect, requireRole(['Admin']), getAllUsers);
router.delete('/:id', protect, requireRole(['Admin']), deleteUser); // <-- This is the missing piece

module.exports = router;