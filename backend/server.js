const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet()); 
app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', documentRoutes);

// Connection lifecycle event listeners
mongoose.connection.on('connecting', () => console.log('Connecting to MongoDB Atlas...'));
mongoose.connection.on('connected', () => console.log('Mongoose event: Connected to DB.'));
mongoose.connection.on('open', () => console.log('Mongoose event: Connection opened successfully.'));
mongoose.connection.on('error', (err) => console.error('Mongoose event error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose event: Disconnected.'));

// Database Connection with explicit timeout settings
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Fails fast in 5 seconds instead of hanging for 30s
})
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`portalDocs server running on port ${PORT}`);
});