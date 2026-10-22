const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Only Owners and Admins can manage permissions
router.post('/grant', verifyToken, requireRole(['Owner', 'Admin']), permissionController.grantAccess);
router.post('/revoke', verifyToken, requireRole(['Owner', 'Admin']), permissionController.revokeAccess);

module.exports = router;