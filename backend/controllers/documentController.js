const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

// Upload a new document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Create the database record for the file
    const newDoc = new Document({
      ownerId: req.user.userId, // Pulled from the JWT token
      filename: req.file.filename,
      originalName: req.file.originalname,
      storagePath: req.file.path,
      category: req.body.category || 'General'
    });

    await newDoc.save();

    // 2. Log the action in our immutable Audit Trail
    await AuditLog.create({
      actorId: req.user.userId,
      action: 'UPLOAD',
      documentId: newDoc._id,
      ipAddress: req.ip,
      details: `Uploaded file: ${req.file.originalname}`
    });

    res.status(201).json({ 
      message: 'Document secured in the vault', 
      document: newDoc 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};