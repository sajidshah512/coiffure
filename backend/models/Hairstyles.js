// models/Hairstyle.js
const { Schema, model } = require("mongoose");

const hairstyleSchema = new Schema({
  name: String,
  imageUrl: String,
  description: String,
  price: Number,
});

module.exports = model("Hairstyle", hairstyleSchema);
