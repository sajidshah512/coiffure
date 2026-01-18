const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  targetOriginalName: String,
  sourceOriginalName: String,
  uploadPaths: {
    target: String,
    source: String
  },
  outputPath: String,     // local path to saved final image
  outputDataUrl: String,  // optional: if image comes back as data URL
  status: { type: String, default: 'pending' }, // pending | done | error
  error: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
