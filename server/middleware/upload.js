const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create type-specific folders
    let targetFolder = 'documents';
    if (file.fieldname.includes('video')) {
      targetFolder = 'videos';
    } else if (file.fieldname.includes('profile')) {
      targetFolder = 'profiles';
    }

    const typeDir = path.join(uploadDir, targetFolder);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    cb(null, path.join(uploadDir, targetFolder));
  },
  filename: function (req, file, cb) {
    // Create unique filename
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on upload type
  let allowedTypes;
  if (file.fieldname.includes('document')) {
    allowedTypes = /jpeg|jpg|png|pdf/;
  } else if (file.fieldname.includes('video')) {
    allowedTypes = /mp4|webm|avi|mov/;
  } else if (file.fieldname.includes('profile')) {
    allowedTypes = /jpeg|jpg|png/;
  }

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse(`Please upload a valid file type`, 400));
  }
};

// Export middleware
exports.uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: fileFilter
}).single('document');

exports.uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
  fileFilter: fileFilter
}).single('video');

exports.uploadProfile = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter
}).single('profile');