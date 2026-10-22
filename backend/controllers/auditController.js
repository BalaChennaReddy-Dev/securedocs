const AuditLog = require('../models/AuditLog');

// Get all activity for a specific document
exports.getDocumentAuditTrail = async (req, res) => {
  try {
    const documentId = req.params.id;

    // Fetch logs, sort by newest first, and populate the actor's email
    const logs = await AuditLog.find({ documentId })
      .sort({ createdAt: -1 })
      .populate('actorId', 'email role');

    res.status(200).json({ logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve audit trail' });
  }
};

// Get system-wide activity (Admin only)
exports.getSystemAuditTrail = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .populate('actorId', 'email role')
      .populate('documentId', 'filename originalName');

    res.status(200).json({ logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve system audit trail' });
  }
};