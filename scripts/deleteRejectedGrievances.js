const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Grievance = require('../models/Grievance');

dotenv.config();

async function deleteRejectedGrievances() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const result = await Grievance.deleteMany({ status: 'Rejected' });
  console.log(`Deleted ${result.deletedCount} rejected grievances.`);

  mongoose.disconnect();
}

deleteRejectedGrievances(); 