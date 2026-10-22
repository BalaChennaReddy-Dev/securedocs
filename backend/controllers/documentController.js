const path = require('path');
const fs = require('fs');
const Permission = require('../models/Permission'); // We need this to check access!
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
// Securely download a document
exports.downloadDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await Document.findById(documentId);

    if (!document) return res.status(404).json({ error: 'Document not found' });

    // --- THE SECURITY CHECKPOINT ---
    let isAuthorized = false;

    if (req.user.role === 'Admin') {
      isAuthorized = true; // Admins see everything
    } else if (document.ownerId.toString() === req.user.userId) {
      isAuthorized = true; // Owners see their own files
    } else {
      // Check if this specific user was granted read or edit access
      const permission = await Permission.findOne({ 
        documentId: document._id, 
        userId: req.user.userId 
      });
      if (permission) isAuthorized = true;
    }

    // --- THE AUDIT TRAIL ---
    // We log the attempt BEFORE we reject them, so we have proof of the attack!
    await AuditLog.create({
      actorId: req.user.userId,
      action: isAuthorized ? 'DOWNLOAD' : 'UNAUTHORIZED_ATTEMPT',
      documentId: document._id,
      ipAddress: req.ip,
      details: isAuthorized ? 'File downloaded' : 'Blocked from downloading file'
    });

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to read this file.' });
    }

    // --- RELEASE THE FILE ---
    // path.resolve ensures we get the absolute path to the file safely
    const filePath = path.resolve(__dirname, '..', document.storagePath); 
    
    if (!fs.existsSync(filePath)) {
       return res.status(404).json({ error: 'Physical file missing from vault' });
    }

    // res.download securely streams the file to the user
    res.download(filePath, document.originalName);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to download document' });
  }
};


// Get documents the user owns or has access to
exports.getDocuments = async (req, res) => {
  try {
    // Files you own
    const ownedDocs = await Document.find({ ownerId: req.user.userId });
    
    // Files shared with you
    const permissions = await Permission.find({ userId: req.user.userId });
    const sharedDocIds = permissions.map(p => p.documentId);
    const sharedDocs = await Document.find({ _id: { $in: sharedDocIds } });

    res.status(200).json({ ownedDocs, sharedDocs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
};

