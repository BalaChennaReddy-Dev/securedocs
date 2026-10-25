const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate role
    if (!['Admin', 'Owner', 'Viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // FIX 1: Save the hash to the 'password' field in the database!
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', role: newUser.role });
  } catch (error) {
    console.error("🔥 REGISTER CRASH DETAILS:", error); 
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login and get JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // FIX 2: Check against user.password instead of user.passwordHash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate token containing the user's ID and Role
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, role: user.role, email: user.email });
  } catch (error) {
    console.error("🔥 LOGIN CRASH DETAILS:", error); 
    res.status(500).json({ error: 'Server error during login' });
  }
};