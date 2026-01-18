const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth'); 
const sendNotification = require("../utils/sendNotification");
const User = require("../models/User");

// Create a new booking (User only)
router.post('/', auth, async (req, res) => {
    try {
        const { stylistId, serviceId, date, time, price, paymentMethod } = req.body;

        // Create full datetime object
        const startTime = new Date(`${date} ${time}`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

        // Check for overlapping booking
        const overlapping = await Booking.findOne({
            stylistId,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (overlapping) {
            return res.status(400).json({
                message: "This time slot is already booked. Please choose another time."
            });
        }

        // Create booking
        const newBooking = new Booking({
            userId: req.user._id,
            stylistId,
            serviceId,
            startTime,
            endTime,
            price,
            // paymentMethod,
            status: "pending"
        });

        await newBooking.save();

            // 🔥 SEND PUSH NOTIFICATION
    const user = await User.findById(req.user._id);

    await sendNotification(
      user.expoPushToken,
      "Booking Confirmed 🎉",
      `Your appointment on ${date} at ${time} has been booked!`
    );
        res.status(201).json(newBooking);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


// Get user's bookings (User  only) - FIXED: Added auth, changed to req.user._id
router.get('/my-bookings', auth, async (req, res) => {
    try {
const bookings = await Booking.find({ userId: req.user._id })
  .populate('stylistId', 'name image')
  .populate('serviceId', 'name type image price');

// 🛡️ Convert old bookings safely
const formattedBookings = bookings.map((booking) => {
  // If new format exists (startTime/endTime)
  if (booking.startTime) {
    return {
      ...booking._doc,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  }

  // If old format exists (date/time) → convert them
  if (booking.date && booking.time) {
    const start = new Date(`${booking.date} ${booking.time}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return {
      ...booking._doc,
      startTime: start,
      endTime: end,
    };
  }

  // If neither exists → fallback
  return {
    ...booking._doc,
    startTime: null,
    endTime: null,
  };
});

res.status(200).json({ data: formattedBookings });

    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: "Server error while fetching user bookings" });
    }
});


// Get all bookings (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        // Admin authentication middleware
        const bookings = await Booking.find()
                                      .populate('userId', 'name email')
                                      .populate('stylistId', 'name')
                                      .populate('serviceId', 'name type');
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update booking status (Admin only)
router.put('/:id/status', async (req, res) => {
    try {
        // Admin authentication middleware
        const { status } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
    try {
        // Admin authentication middleware
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
