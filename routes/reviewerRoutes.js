const express = require('express');
const router = express.Router();
const reviewerController = require('../controllers/reviewerController');
const {authenticateUser} = require("../middlewares/authMiddleware");

router.use(authenticateUser);
router.get('/', async (req, res, next) => {
    try {
        await reviewerController.getReviewers(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/getMyTopics', async (req, res, next) => {
    try {
        await reviewerController.getMyTopics(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        await reviewerController.getReviewerById(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        await reviewerController.updateReviewer(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await reviewerController.deleteReviewer(req, res);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
