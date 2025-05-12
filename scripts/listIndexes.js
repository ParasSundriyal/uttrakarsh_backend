const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function listIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log('Indexes:', indexes);
  } catch (err) {
    console.error('Error listing indexes:', err);
  } finally {
    await mongoose.disconnect();
  }
}

listIndexes();