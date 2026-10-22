const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Document = require('../models/Document');
const Permission = require('../models/Permission'); // We need this to wipe the DB

describe('Security Posture: Document Isolation', () => {
  let viewerToken;
  let documentId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
    // Log in as our existing Viewer
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@trustvault.com', password: 'password123' });
    
    viewerToken = res.body.token;

    // Grab a document
    const doc = await Document.findOne();
    documentId = doc._id;

    // GUARANTEE ISOLATION: Manually wipe any permissions for this user before testing
    const viewerUser = await User.findOne({ email: 'viewer@trustvault.com' });
    await Permission.deleteMany({ documentId: documentId, userId: viewerUser._id });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('FAIL-SAFE: Viewer should be blocked from downloading a file without permission', async () => {
    // 1. The Attack: Viewer tries to access the document
    const response = await request(app)
      .get(`/api/documents/download/${documentId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    // 2. The Assertion: Server must respond with 403 Forbidden
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Access denied. You do not have permission to read this file.');
  });
});