const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../public/images'); // Changed path
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
} else {
  console.log(`Uploads directory already exists: ${uploadsDir}`);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination: ', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExtension = path.extname(file.originalname);
    const newFileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    console.log('Multer filename: ', newFileName);
    cb(null, newFileName);
  },
});

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    console.log('File type accepted: ', file.mimetype);
    cb(null, true);
  } else {
    console.log('File type rejected: ', file.mimetype);
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Upload route
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    console.log('No file uploaded.');
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  console.log('File uploaded successfully:', req.file);
  // Construct the URL to the uploaded image
  const imageUrl = `/images/${req.file.filename}`;
  console.log('Generated image URL:', imageUrl);
  res.status(200).json({ success: true, imageUrl: imageUrl });
});

module.exports = router;
