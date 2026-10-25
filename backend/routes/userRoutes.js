const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Only Admins can access these routes
router.get('/', protect, requireRole(['Admin']), getAllUsers);
router.delete('/:id', protect, requireRole(['Admin']), deleteUser);

module.exports = router;