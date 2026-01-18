
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['Dye', 'Cutting', 'Blowdry', 'Hairstyle'],
        required: true,
    },
    image: {
        type: String, // URL or path to image
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,

    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    ratings: [{ // To store individual ratings for calculating average
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
    }],
}, { timestamps: true });

// Middleware to update averageRating whenever a new rating is added
serviceSchema.pre('save', function(next) {
    if (this.isModified('ratings') && this.ratings.length > 0) {
        const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
        this.averageRating = totalRating / this.ratings.length;
    } else if (this.ratings.length === 0) {
        this.averageRating = 0;
    }
    next();
});

module.exports = mongoose.model('Service', serviceSchema);
