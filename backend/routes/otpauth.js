// routes/auth.js (or routes/users.js, adjust path accordingly)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto'); // Node.js built-in module for generating random strings
const sendEmail = require('../utils/sendEmail'); // Your email utility
const bcrypt = require("bcryptjs");

// @route   POST /api/auth/send-otp
// @desc    Send OTP to user's email for verification
// @access  Public (or private if you want to ensure user is registered first)
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email.' });
        }

        // Generate a 5-digit OTP
        const otp = Math.floor(10000 + Math.random() * 90000).toString();

        // Set OTP and expiration time (e.g., 10 minutes)
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await user.save();

        const message = `
            <h1>Email Verification</h1>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code is valid for 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Coiffure: Your Email Verification Code',
                message,
            });

            res.status(200).json({ message: 'OTP sent to your email.' });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Clear OTP fields if email sending fails to prevent stale OTPs
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
        }

    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and mark user as verified
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        // Check if OTP matches and is not expired
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            // Optionally, clear OTP fields after a failed attempt or expiration
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // OTP is valid, mark user as verified
        user.isVerified = true;
        user.otp = undefined; // Clear OTP after successful verification
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!', isVerified: true });

    } catch (error) {
        console.error('Error in verify-otp:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found with this email." });
        }

        // Generate reset OTP
        const resetOtp = Math.floor(10000 + Math.random() * 90000).toString();
        user.resetOtp = resetOtp;
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const message = `
            <h1>Reset Your Password</h1>
            <p>Your password reset code is:</p>
            <h2>${resetOtp}</h2>
            <p>This OTP will expire in 10 minutes.</p>
        `;

        await sendEmail({
            email: user.email,
            subject: "Coiffure: Password Reset Code",
            message,
        });

        return res.status(200).json({ message: "Reset OTP sent to your email." });

    } catch (error) {
        console.error("Error in forgot-password:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// @route   POST /api/auth/verify-reset-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post("/verify-reset-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.resetOtp || !user.resetOtpExpires) {
            return res.status(400).json({ message: "No OTP found. Please request again." });
        }

        if (user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
            user.resetOtp = undefined;
            user.resetOtpExpires = undefined;
            await user.save();
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        return res.status(200).json({ message: "OTP verified. You may reset your password now." });

    } catch (error) {
        console.error("Error in verify-reset-otp:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.password = newPassword; // ⛔ DO NOT HASH HERE
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save(); // ✔ Model will hash automatically

        return res.status(200).json({ message: 'Password reset successfully!' });

    } catch (error) {
        console.error('Reset Password error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
});


module.exports = router;
