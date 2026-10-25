const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// FIX: Add 'Owner' to the array so the Dashboard can actually fetch the users!
router.get('/', verifyToken, requireRole(['Admin', 'Owner']), getAllUsers);

// Only Admins can delete users
router.delete('/:id', verifyToken, requireRole(['Admin']), deleteUser);

module.exports = router;