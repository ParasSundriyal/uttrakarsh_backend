const mongoose = require('mongoose');
const Department = require('../models/Department');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const departments = [
  {
    name: 'Academic Department',
    departmentId: 'ACAD001',
    password: 'acad123'
  },
  {
    name: 'Administration Department',
    departmentId: 'ADMIN001',
    password: 'admin123'
  },
  {
    name: 'Infrastructure Department',
    departmentId: 'INFRA001',
    password: 'infra123'
  },
  {
    name: 'Hostel Department',
    departmentId: 'HOSTEL001',
    password: 'hostel123'
  },
  {
    name: 'General Department',
    departmentId: 'GEN001',
    password: 'gen123'
  }
];

const createDepartments = async () => {
  try {
    // Check if departments already exist
    const existingDepartments = await Department.find({});
    if (existingDepartments.length > 0) {
      console.log('Departments already exist. Here are their credentials:');
      existingDepartments.forEach(dept => {
        console.log(`\nDepartment: ${dept.name}`);
        console.log(`Department ID: ${dept.departmentId}`);
      });
      process.exit(0);
    }

    // Create departments
    for (const dept of departments) {
      await Department.create(dept);
      console.log(`Created department: ${dept.name}`);
      console.log(`Department ID: ${dept.departmentId}`);
      console.log(`Password: ${dept.password}\n`);
    }

    console.log('All departments created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating departments:', error);
    process.exit(1);
  }
};

createDepartments(); 