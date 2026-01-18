
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isVerified: { // New field: to track if email is verified
        type: Boolean,
        default: false,
    },
    otp: String, // New field: to store the OTP
    otpExpires: Date, // New field: to store OTP expiration time
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetOtp: String,
resetOtpExpires: Date,

    expoPushToken: { type: String, default: null },

});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
