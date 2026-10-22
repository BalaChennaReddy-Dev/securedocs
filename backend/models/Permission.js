const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessLevel: { type: String, enum: ['Read', 'Edit'], required: true }
}, { timestamps: true });

// Prevent duplicate permissions for the same user on the same document
permissionSchema.index({ documentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Permission', permissionSchema);