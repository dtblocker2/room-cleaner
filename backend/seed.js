require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  if (!(await User.findOne({ email: 'staff@hostel.com' }))) {
    await User.create({
      name: 'Hostel Cleaning Staff', email: 'staff@hostel.com',
      password: 'staff123', role: 'staff', phone: '9999999999'
    });
    console.log('✅ Staff account created  →  staff@hostel.com / staff123');
  } else {
    console.log('ℹ️  Staff account already exists');
  }

  if (!(await User.findOne({ email: 'student@hostel.com' }))) {
    await User.create({
      name: 'Demo Student', email: 'student@hostel.com',
      password: 'student123', role: 'student',
      roomNumber: '101', hostelBlock: 'A', phone: '8888888888'
    });
    console.log('✅ Student account created →  student@hostel.com / student123');
  } else {
    console.log('ℹ️  Student account already exists');
  }

  await mongoose.disconnect();
  console.log('\n🎉 Seeding complete!\n');
}

seed().catch(console.error);