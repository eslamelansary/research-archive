const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');
const multer = require('multer');
const {authenticateUser} = require("../middlewares/authMiddleware");

// Multer configuration to handle file uploads and validate file types
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    const fileExtension = file.originalname.slice(-4).toLowerCase();
    const isExtensionAllowed = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    if(isExtensionAllowed) {
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
router.post('/upload', async (req, res, next) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            return res.status(422).json({ message: 'Invalid file type. Only PDF, TXT, and DOCX files are allowed.' });
        }

        if (!req.file) {
            return res.status(422).json({ message: 'No file uploaded or invalid file type. Only PDF, TXT, and DOCX files are allowed.' });
        }

        try {
            await paperController.uploadPaper(req, res);
        } catch (err) {
            next(err);
        }
    });
});

router.get('/:id', async (req, res, next) => {
    try {
        await paperController.getPaperById(req, res);
    } catch (err) {
        next(err);
    }
})

router.post('/', async (req, res, next) => {
    try {
        await paperController.getAllPapers(req, res);
    } catch (e) {
        next(e);
    }
})

router.post('/assign-reviewer', async (req, res, next) => {
    try {
        await paperController.assignPaperToReviewer(req, res);
    } catch (err) {
        next(err);
    }
});

router.post('/comment/:id', async (req, res, next) => {
    try {
        await paperController.addComment(req, res);
    } catch (e) {
        next(e);
    }
});

router.delete('/comment/:paperId/:commentId', async (req, res, next) => {
    try {
        await paperController.deleteComment(req, res);
    } catch (e) {
        next(e);
    }
});

router.post('/action/:action', async (req, res, next) => {
    try {
        await paperController.takeAction(req, res);
    } catch (e) {
        next(e);
    }
})

router.post('/topics-statistics', async (req, res, next) => {
    try {
        await paperController.getTopicsNumber(req, res);
    } catch (e) {
        next(e);
    }
})

router.post('/download', async (req, res, next) => {
    try {
        await paperController.downloadPaper(req, res);
    } catch (e) {
        next(e);
    }
});

module.exports = router;