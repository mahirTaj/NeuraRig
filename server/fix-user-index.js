const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get the users collection
      const usersCollection = mongoose.connection.collection('users');
      
      // Try to drop the old username index if it exists
      try {
        await usersCollection.dropIndex('username_1');
        console.log('Dropped old username index');
      } catch (error) {
        if (error.code === 27) { // IndexNotFound
          console.log('Username index not found, skipping drop');
        } else {
          throw error;
        }
      }
      
      // Remove any documents with null name or email
      const result = await usersCollection.deleteMany({
        $or: [
          { name: null },
          { email: null }
        ]
      });
      console.log(`Removed ${result.deletedCount} invalid user documents`);
      
      // Drop existing indexes if they exist
      try {
        await usersCollection.dropIndex('name_1');
        await usersCollection.dropIndex('email_1');
        console.log('Dropped existing name and email indexes');
      } catch (error) {
        if (error.code === 27) {
          console.log('Existing indexes not found, skipping drop');
        } else {
          throw error;
        }
      }
      
      // Create new indexes
      await usersCollection.createIndex({ name: 1 }, { unique: true });
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('Created new indexes for name and email');
      
      console.log('Successfully updated user collection indexes');
    } catch (error) {
      console.error('Error updating indexes:', error);
    } finally {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 