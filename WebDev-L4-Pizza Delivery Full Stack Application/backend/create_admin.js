const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('./models/user.model');

const createUsers = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected.');

    // 1. Admin account
    console.log('Seeding Admin account...');
    await User.deleteMany({ email: 'admin@pizzadelivery.com' });
    const admin = await User.create({
      name: 'Pizzeria Admin',
      email: 'admin@pizzadelivery.com',
      password: 'admin123',
      phone: '9876543210',
      role: 'Admin',
      verified: true
    });
    console.log(`Admin created: ${admin.email} (Password: admin123)`);

    // 2. Customer account
    console.log('Seeding Customer account...');
    await User.deleteMany({ email: 'user@pizzadelivery.com' });
    const user = await User.create({
      name: 'John Doe',
      email: 'user@pizzadelivery.com',
      password: 'user123',
      phone: '9876543211',
      role: 'User',
      verified: true
    });
    console.log(`Customer created: ${user.email} (Password: user123)`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

createUsers();
