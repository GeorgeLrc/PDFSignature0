const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter email address"],
    unique: [true, "Email address already registered"],
  },
  password: {
    type: String,
    min: 6,
  },
  resetOtp: {
    type: String,
    default: "",
  },
  resetOtpExpireAt: {
    type: Number,
    default: 0,
  },
  isRestricted: {
    type: Boolean,
    default: false,
  },
  image: { type: String, default: "" },
  date: { type: Date, required: true },
  recentTemplates: [
    {
      templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
      lastOpened: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
