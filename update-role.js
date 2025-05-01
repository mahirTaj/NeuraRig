import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/neurarig', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Update user role
const updateRole = async () => {
  try {
    const result = await mongoose.connection.collection('users').updateOne(
      { username: 'superadmin' },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('User role updated to admin successfully');
    } else {
      console.log('User not found or already an admin');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateRole(); 