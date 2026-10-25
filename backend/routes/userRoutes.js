const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireRole(['Admin', 'Owner']), getAllUsers);

router.delete('/:id', verifyToken, requireRole(['Admin']), deleteUser);

module.exports = router;