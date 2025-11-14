const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // Use the 'uploads' folder as destination
    callback(null, "./files");
  },
  filename: function (req, file, callback) {
    const fileExt = path.extname(file.originalname) || ".pdf"; // Ensure file has an extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    callback(null, uniqueSuffix + fileExt); // Ensure the correct extension
  },
});
const uploadPdf = multer({ storage });

module.exports = uploadPdf;
