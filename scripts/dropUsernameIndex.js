const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function dropUsernameIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await mongoose.connection.db.collection('users').dropIndex('username');
    console.log('Dropped index:', result);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('username index does not exist.');
    } else {
      console.error('Error dropping index:', err);
    }
  } finally {
    await mongoose.disconnect();
  }
}

dropUsernameIndex();