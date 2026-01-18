const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type'
  },
  type: {
    type: String,
    required: true,
    enum: ['Dye', 'Cutting', 'Blowdry', 'Hairstyle', 'Stylist'] // Added 'Stylist' if needed
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Removed extra space here
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: '',
  }
}, { timestamps: true });

ratingSchema.index({ serviceId: 1, userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
