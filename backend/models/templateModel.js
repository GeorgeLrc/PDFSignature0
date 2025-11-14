const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  uploaderId: {
    type: String,
    // required: true,
  },
  title: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  filePath: {
    type: String,
    required: true,
  },
  frequency: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Template", templateSchema);
