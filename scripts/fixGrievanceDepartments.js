const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Grievance = require('../models/Grievance');
const Department = require('../models/Department');

dotenv.config();

const categoryToDepartment = {
  Academic: 'ACAD001',
  Administration: 'ADMIN001',
  Infrastructure: 'INFRA001',
  Hostel: 'HOSTEL001',
  General: 'GEN001',
};

async function fixDepartments() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const grievances = await Grievance.find({});
  let updated = 0;

  for (const grievance of grievances) {
    if (!grievance.department) {
      const deptId = categoryToDepartment[grievance.category];
      if (deptId) {
        const department = await Department.findOne({ departmentId: deptId });
        if (department) {
          grievance.department = department._id;
          await grievance.save();
          updated++;
          console.log(`Updated grievance ${grievance._id} with department ${department.departmentId}`);
        }
      }
    }
  }

  console.log(`Updated ${updated} grievances.`);
  mongoose.disconnect();
}

fixDepartments(); 