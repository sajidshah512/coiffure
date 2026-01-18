const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const auth = require('../middleware/auth');

const validTypes = ['Dye', 'Cutting', 'Blowdry', 'Hairstyle', 'Stylist'];

router.get('/', auth, async (req, res) => {
  const { serviceId, type } = req.query;
  const userId = req.user._id; // Assuming auth middleware correctly sets req.user._id

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID not found in request.' });
  }
  if (!serviceId || !type) {
    return res.status(400).json({ message: 'Missing parameters: serviceId and type are required.' });
  }
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: 'Invalid serviceId format.' });
  }
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: `Invalid type parameter. Must be one of: ${validTypes.join(', ')}` });
  }

  try {
    // FIX: Use 'new' keyword when creating ObjectId instances
    const objectServiceId = new mongoose.Types.ObjectId(serviceId);
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const agg = await Rating.aggregate([
      { $match: { serviceId: objectServiceId, type } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const average = agg.length > 0 ? agg[0].avgRating : 0;
    const totalRatings = agg.length > 0 ? agg[0].count : 0;

    const userRatingDoc = await Rating.findOne({
      serviceId: objectServiceId, // Use converted ObjectId
      type,
      userId: objectUserId, // Use converted ObjectId
    });

    res.json({
      average,
      totalRatings,
      userRating: userRatingDoc ? userRatingDoc.rating : 0,
      userFeedback: userRatingDoc ? userRatingDoc.feedback : '',
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Server error while fetching ratings.' });
  }
});

router.post('/', auth, async (req, res) => {
  const { serviceId, type, rating, feedback } = req.body;
  const userId = req.user._id; // Assuming auth middleware correctly sets req.user._id

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID not found in request.' });
  }
  if (!serviceId || !type || rating == null) {
    return res.status(400).json({ message: 'Missing parameters: serviceId, type, and rating are required.' });
  }
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: 'Invalid serviceId format.' });
  }
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: `Invalid type parameter. Must be one of: ${validTypes.join(', ')}` });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    // FIX: Use 'new' keyword when creating ObjectId instances
    const objectServiceId = new mongoose.Types.ObjectId(serviceId);
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const updated = await Rating.findOneAndUpdate(
      { serviceId: objectServiceId, type, userId: objectUserId }, // Use converted ObjectIds
      { rating, feedback },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, rating: updated });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Server error while submitting rating.' });
  }
});

module.exports = router;
