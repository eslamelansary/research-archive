const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');
const multer = require('multer');
const { authenticateUser } = require("../middlewares/authMiddleware");

// Multer configuration to handle file uploads and validate file types
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, TXT, and DOCX files are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

router.use(authenticateUser);

// Endpoint for uploading papers
router.post('/upload', upload.single('file'), paperController.uploadPaper);

module.exports = router;