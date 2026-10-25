const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', protect, requireRole(['Admin']), getAllUsers);
router.delete('/:id', protect, requireRole(['Admin']), deleteUser); 
console.log("DEBUG IMPORTS:", { protect, requireRole, getAllUsers, deleteUser });

module.exports = router;