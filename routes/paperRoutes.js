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
router.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        await paperController.uploadPaper(req, res);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        await paperController.getPaperById(req, res);
    } catch (err) {
        next(err);
    }
})

router.get('/', async (req, res, next) => {
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

router.post('/date', async (req, res, next) => {
    try {
        await paperController.findInDay(req, res);
    }catch (e) {
        next(e);
    }
})

router.post('/action/:action', async (req, res, next) => {
    try {
        await paperController.takeAction(req, res);
    }catch (e) {
        next(e);
    }
})

router.post('/topics-statistics', async (req, res, next) => {
    try {
        await paperController.getTopicsNumber(req, res);
    }catch (e) {
        next(e);
    }
})

router.post('/my-papers-topic', async (req, res, next) => {
    try {
        await paperController.getMyPapersByTopic(req, res);
    } catch (e) {
        next(e);
    }
})
module.exports = router;
