const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    stylistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stylist',
        required: true,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    // date: {
    //     type: Date,
    //     required: true,
    // },
    // time: {
    //     type: String, // e.g., "11:00 AM"
    //     required: true,
    // },
    startTime: { type: Date, required: true },   // NEW
    endTime: { type: Date, required: true },     // NEW
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
