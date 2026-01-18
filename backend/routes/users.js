const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // For authentication
const auth = require('../middleware/auth'); // Import auth middleware
// const crypto = require('crypto'); // Node.js built-in module for generating random strings
// const sendEmail = require('../utils/sendEmail'); // Your email utility

// User Registration (Signup)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, confirmPassword } = req.body;

      // Validate required fields
      if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
      }

       // Password match check
       if (password !== confirmPassword) {
       return res.status(400).json({ message: "Passwords do not match" });
       }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password,
            // Role defaults to 'user' as per schema, no need to explicitly set here
            // Unless you want to allow registration of admins, which is NOT recommended
        });

        await user.save();

        // Generate JWT token with user ID and ROLE
        const token = jwt.sign({ id: user._id, name: user.name, email:user.email , role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.status(201).json({ message: 'Signup successfully', token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        } 

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with user ID and ROLE
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return user role in the login response
        res.status(200).json({ message: 'Logged in successfully', token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//routes for pushing notification
router.post("/save-push-token", auth, async (req, res) => {
  try {
    const { expoPushToken } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      expoPushToken,
    });

    res.json({ message: "Push token saved!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error saving token" });
  }
});


// Get User Profile (requires authentication)
router.get('/profile', auth, async (req, res) => {
    try {
        // Ensure req.user is populated by auth middleware
        if (!req.user || !req.user._id) {
          return res.status(401).json({ message: 'Unauthorized: User ID not found in request.' });
        }
     // FIXED: Use req.user._id instead of req.user.id
        const user = await User.findById(req.user._id).select('-password'); // Exclude password
        if (!user) {
            console.log('Profile Route: No user found for ID:', req.user._id); // DEBUG LOG
            return res.status(404).json({ message: 'User  not found' });
        }
        // Wrap in { data: user } for API consistency
        res.status(200).json({ data: user });
    } catch (error) {
        console.error('Profile Route Error:', error); // Enhanced logging
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
});
module.exports = router;
