const Permission = require('../models/Permission');
const Document = require('../models/Document');
const User = require('../models/user');
const AuditLog = require('../models/Auditlog');

// Grant access to a document
exports.grantAccess = async (req, res) => {
  try {
    const { documentId, targetUserEmail, accessLevel } = req.body;

    // 1. Verify the document exists and the requester owns it
    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ error: 'Document not found' });
    
    if (document.ownerId.toString() !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only the owner can grant access' });
    }

    // 2. Find the user we are giving access to
    const targetUser = await User.findOne({ email: targetUserEmail });
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    // 3. Create or update the permission
    const permission = await Permission.findOneAndUpdate(
      { documentId, userId: targetUser._id },
      { accessLevel },
      { upsert: true, new: true } // upsert creates it if it doesn't exist
    );

    // 4. Log the audit trail
    await AuditLog.create({
      actorId: req.user.userId,
      action: 'GRANT_ACCESS',
      documentId: document._id,
      details: `Granted ${accessLevel} access to ${targetUserEmail}`
    });

    res.status(200).json({ message: `Access granted to ${targetUserEmail}`, permission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to grant access' });
  }
};

// Revoke access instantly
exports.revokeAccess = async (req, res) => {
  try {
    const { documentId, targetUserEmail } = req.body;

    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ error: 'Document not found' });

    if (document.ownerId.toString() !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only the owner can revoke access' });
    }

    const targetUser = await User.findOne({ email: targetUserEmail });
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    await Permission.findOneAndDelete({ documentId, userId: targetUser._id });

    await AuditLog.create({
      actorId: req.user.userId,
      action: 'REVOKE_ACCESS',
      documentId: document._id,
      details: `Revoked access from ${targetUserEmail}`
    });

    res.status(200).json({ message: `Access revoked from ${targetUserEmail}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to revoke access' });
  }
};