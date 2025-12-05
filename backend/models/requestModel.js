const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming there's a User model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      // Optional: deadline for document to be signed. If not provided, no time-based status.
    },
    recipients: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Assuming there's a User model
          required: true,
        },
        order: {
          type: Number,
          // Position in signing order (1, 2, 3, etc.).
          // Not required because requests may allow non-sequential signing.
        },
        signed: {
          type: Boolean,
          default: false,
        },
        signedAt: {
          type: Date, // When they signed
        },
        signaturePositions: [
          {
            page: { type: Number, required: true }, // PDF Page Number
            x: { type: Number, required: true }, // X-coordinate
            y: { type: Number, required: true }, // Y-coordinate
            width: { type: Number },
            height: { type: Number },
          },
        ],
      },
    ],
    emailSubject: {
      type: String,
      required: true,
      trim: true,
    },
    emailMessage: {
      type: String,
      required: true,
      trim: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    pdfVersions: [
      {
        version: { type: Number, required: true },
        filePath: { type: String, required: true },
        signedBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          signedAt: { type: Date, default: Date.now },
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
