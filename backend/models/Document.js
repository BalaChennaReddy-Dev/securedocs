const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  storagePath: { type: String, required: true }, // Where it lives on disk/S3
  category: { type: String, default: 'General' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);