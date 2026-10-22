const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
  try {
    // Only fetch the email and role. NEVER fetch the passwordHash!
    const users = await User.find({}, 'email role');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};