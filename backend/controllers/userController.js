const User = require('../models/user'); // Make sure this matches your filename exactly (User.js or user.js)

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const User = require('../models/user');

// (Keep your existing getAllUsers function here)

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("🔥 DELETE CRASH DETAILS:", error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};