const mongoose = require('mongoose');

const stylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String, // URL or path to image
        required: true,
    },
    // rating: {
    //     type: Number,
    //     min: 0,
    //     max: 5,
    //     default: 0,
    // },
    description: {
        type: String,
        trim: true,
    },
    // Add availability, services offered, etc.
    availableSlots: [{
        date: Date,
        time: String, // e.g., "10:00 AM"
    }],
    specialties: [{
        type: String, // e.g., "Dye", "Cutting", "Blowdry", "Hairstyle"
    }],
}, { timestamps: true });

module.exports = mongoose.model('Stylist', stylistSchema);
