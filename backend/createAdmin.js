require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('DB connected for admin creation');

    const adminEmail = 'tansirshah130@gmail.com';
    const adminPassword = 'Adminpass';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Admin already exists: ${adminEmail}`);
    } else {
      admin = new User({
        name: "Admin User",
        email: adminEmail,
        password: adminPassword, 
        role: "admin",
      });

      await admin.save();
      console.log(`Admin user created: ${adminEmail}`);
    }

    mongoose.disconnect();
  })
  .catch(err => console.error("Error creating admin:", err));
