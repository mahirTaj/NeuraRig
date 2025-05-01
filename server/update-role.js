const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/neurarig', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateUserRole() {
  try {
    const user = await User.findOneAndUpdate(
      { username: 'superadmin' },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log('User role updated successfully:', user);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateUserRole(); 