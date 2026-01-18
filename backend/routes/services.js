const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images (optional but recommended)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter }); // Apply fileFilter here

// Helper function to construct full image URL
const getFullImageUrl = (req, filename) => {
    if (!filename) return null; // Handle cases where image might be null or undefined
    // Check if it's already a full URL (e.g., from external source or previous full URL storage)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    // Construct full URL using request protocol, host, and the static path
    return `${req.protocol}://${req.get('host')}${filename}`;
};

// Add a new service (Admin only) - updated to handle image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Admin middleware (keep as is) - assuming it's applied in server.js
    // For example: app.use('/api/services', auth, adminAuth, serviceRoutes);

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const { name, type, description, price } = req.body; // Removed 'image' from destructuring as it comes from req.file

    if (!name || !type || !price) { // Removed 'image' from validation
      return res.status(400).json({ message: 'Please fill all the required fields' });
    }

    // Save image path relative to server root
    const imagePath = `/uploads/${req.file.filename}`;

    const newService = new Service({
      name,
      type,
      description,
      price,
      image: imagePath, // Store the relative path
    });

    await newService.save();

    // Return the newly created service with the full image URL
    const serviceResponse = {
        ...newService._doc,
        image: getFullImageUrl(req, newService.image)
    };
    res.status(201).json(serviceResponse);

  } catch (error) {
    console.error(error);
    // Handle Multer errors specifically
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all services (can filter by type) - MODIFIED TO RETURN FULL IMAGE URLS
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.type) {
      query.type = req.query.type;
    }
    const services = await Service.find(query);

    // Map services to include full image URLs
    const servicesWithFullUrls = services.map(service => ({
        ...service._doc, // Use _doc to get plain JavaScript object from Mongoose document
        image: getFullImageUrl(req, service.image)
    }));

    res.status(200).json(servicesWithFullUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single service by ID - MODIFIED TO RETURN FULL IMAGE URL
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Return the service with the full image URL
    const serviceResponse = {
        ...service._doc,
        image: getFullImageUrl(req, service.image)
    };
    res.status(200).json(serviceResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a service (Admin only) - MODIFIED TO HANDLE OPTIONAL IMAGE UPLOAD
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    // Admin middleware (assuming it's applied in server.js)

    const updateData = { ...req.body }; // Start with all body data

    // If a new image file is uploaded, update the image path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`; // Store the new relative path
    } else if (req.body.image === null || req.body.image === '') {
        // If frontend explicitly sends image: null or empty string, remove image
        updateData.image = null;
    }
    // If req.file is not present and req.body.image is not explicitly null/empty,
    // then the image field in the database remains unchanged.

    const updatedService = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Return the updated service with the full image URL
    const serviceResponse = {
        ...updatedService._doc,
        image: getFullImageUrl(req, updatedService.image)
    };
    res.status(200).json(serviceResponse);

  } catch (error) {
    console.error(error);
    // Handle Multer errors specifically
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a service (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Admin middleware (assuming it's applied in server.js)
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    // Optionally, delete the image file from the server's uploads folder
    // if (deletedService.image) {
    //     const imagePathToDelete = path.join(__dirname, '..', deletedService.image);
    //     fs.unlink(imagePathToDelete, (err) => {
    //         if (err) console.error('Failed to delete image file:', err);
    //     });
    // }
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a rating to a service
router.post('/:id/rate', async (req, res) => {
  try {
    // User authentication middleware (assuming req.user.id is available)
    const { rating, comment } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user already rated this service
    const existingRatingIndex = service.ratings.findIndex(r => r.userId.toString() === req.user.id);

    if (existingRatingIndex > -1) {
      // Update existing rating
      service.ratings[existingRatingIndex].rating = rating;
      service.ratings[existingRatingIndex].comment = comment;
    } else {
      // Add new rating
      service.ratings.push({ userId: req.user.id, rating, comment });
    }

    await service.save(); // Pre-save hook will update averageRating

    // Return the updated service with the full image URL
    const serviceResponse = {
        ...service._doc,
        image: getFullImageUrl(req, service.image)
    };
    res.status(200).json(serviceResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
