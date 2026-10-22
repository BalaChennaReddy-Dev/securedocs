const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Owners and Admins can see the history of a specific document
router.get('/document/:id', verifyToken, requireRole(['Owner', 'Admin']), auditController.getDocumentAuditTrail);

// ONLY Admins can see the entire system history
router.get('/system', verifyToken, requireRole(['Admin']), auditController.getSystemAuditTrail);

module.exports = router;