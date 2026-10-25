const User = require('../models/user'); // Check your capitalization! Use 'user' if the file is lowercase.

exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users but exclude their passwords
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Prevent the Admin from accidentally deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};