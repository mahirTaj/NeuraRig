const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurarig')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get the users collection
      const usersCollection = mongoose.connection.collection('users');
      
      // Find all users with username field
      const users = await usersCollection.find({ username: { $exists: true } }).toArray();
      console.log(`Found ${users.length} users with username field`);
      
      // Update each user document
      for (const user of users) {
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: { name: user.username },
            $unset: { username: "" }
          }
        );
        console.log(`Updated user ${user._id}: username -> name`);
      }
      
      console.log('Successfully updated all user documents');
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 