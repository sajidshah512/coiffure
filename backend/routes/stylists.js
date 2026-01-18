const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Stylist = require('../models/Stylist');

// Configure multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    // Use timestamp + original extension for unique filenames
    cb(null, Date.now() + path.extname(file.originalname));
  },
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

const upload = multer({ storage, fileFilter });

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

// Get all stylists - MODIFIED TO RETURN FULL IMAGE URLS
router.get('/', async (req, res) => {
  try {
    const stylists = await Stylist.find();

    // Map stylists to include full image URLs
    const stylistsWithFullUrls = stylists.map(stylist => ({
        ...stylist._doc,
        image: getFullImageUrl(req, stylist.image)
    }));

    res.status(200).json(stylistsWithFullUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single stylist by ID - MODIFIED TO RETURN FULL IMAGE URL
router.get('/:id', async (req, res) => {
  try {
    const stylist = await Stylist.findById(req.params.id);
    if (!stylist) {
      return res.status(404).json({ message: 'Stylist not found' });
    }

    // Return the stylist with the full image URL
    const stylistResponse = {
        ...stylist._doc,
        image: getFullImageUrl(req, stylist.image)
    };
    res.status(200).json(stylistResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new stylist (Admin only)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // TODO: Add authentication/authorization middleware to check admin role

    // Validate required fields
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'Name, image, and description are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Construct image path (assuming you serve /uploads statically)
    const imagePath = `/uploads/${req.file.filename}`;

    const newStylist = new Stylist({
      name,
      description,
      image: imagePath, // Store the relative path
    });

    await newStylist.save();

    // Return the newly created stylist with the full image URL
    const stylistResponse = {
        ...newStylist._doc,
        image: getFullImageUrl(req, newStylist.image)
    };
    res.status(201).json(stylistResponse);

  } catch (error) {
    console.error(error);
    // Multer file filter error handling
    if (error instanceof multer.MulterError || error.message === 'Only image files are allowed!') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a stylist (Admin only) with optional image upload - MODIFIED TO RETURN FULL IMAGE URL
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    // TODO: Add authentication/authorization middleware to check admin role

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

    const updatedStylist = await Stylist.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedStylist) {
      return res.status(404).json({ message: 'Stylist not found' });
    }

    // Return the updated stylist with the full image URL
    const stylistResponse = {
        ...updatedStylist._doc,
        image: getFullImageUrl(req, updatedStylist.image)
    };
    res.status(200).json(stylistResponse);

  } catch (error) {
    console.error(error);
    // Multer file filter error handling
    if (error instanceof multer.MulterError || error.message === 'Only image files are allowed!') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete a stylist (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Add authentication/authorization middleware to check admin role

    const deletedStylist = await Stylist.findByIdAndDelete(req.params.id);
    if (!deletedStylist) {
      return res.status(404).json({ message: 'Stylist not found' });
    }
    // Optionally, delete the image file from the server's uploads folder
    // if (deletedStylist.image) {
    //     const imagePathToDelete = path.join(__dirname, '..', deletedStylist.image);
    //     fs.unlink(imagePathToDelete, (err) => {
    //         if (err) console.error('Failed to delete image file:', err);
    //     });
    // }
    res.status(200).json({ message: 'Stylist deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
