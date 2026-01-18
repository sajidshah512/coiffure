const express = require('express');
const axios = require('axios');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });  // Temp storage for images

// Gradio API URL (replace with your ngrok URL)
const GRADIO_URL = 'https://your-ngrok-url.ngrok-free.dev/api/predict';

router.post('/tryon', upload.fields([{ name: 'target' }, { name: 'source' }]), async (req, res) => {
  try {
    const { seed = 1234, sample_step = 1, t = 500, erode_kernel_size = 7 } = req.body;
    const targetFile = req.files.target[0];
    const sourceFile = req.files.source[0];

    // Convert images to base64 (Gradio expects this for API calls)
    const fs = require('fs');
    const targetBase64 = fs.readFileSync(targetFile.path, 'base64');
    const sourceBase64 = fs.readFileSync(sourceFile.path, 'base64');

    // Prepare payload for Gradio API
    const payload = {
      data: [
        `data:image/png;base64,${targetBase64}`,  // Target image
        `data:image/png;base64,${sourceBase64}`,  // Source image
        parseInt(seed),
        parseInt(sample_step),
        parseInt(t),
        parseInt(erode_kernel_size)
      ]
    };

    // Call Gradio API
    const response = await axios.post(GRADIO_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Gradio returns images as base64 in response.data.data[0] (gallery)
    const results = response.data.data[0];  // Array of base64 images
    res.json({ success: true, images: results });

    // Cleanup temp files
    fs.unlinkSync(targetFile.path);
    fs.unlinkSync(sourceFile.path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Try-on failed' });
  }
});

module.exports = router;