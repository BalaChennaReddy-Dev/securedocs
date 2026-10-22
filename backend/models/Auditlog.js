const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    enum: ['UPLOAD', 'DOWNLOAD', 'READ', 'EDIT', 'DELETE', 'GRANT_ACCESS', 'REVOKE_ACCESS', 'UNAUTHORIZED_ATTEMPT'], 
    required: true 
  },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }, // Can be null if it's a general system action
  ipAddress: { type: String },
  details: { type: String } // Extra context
}, { timestamps: { createdAt: true, updatedAt: false } }); // updatedAt is false because logs should NEVER change

module.exports = mongoose.model('AuditLog', auditLogSchema);