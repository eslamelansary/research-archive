const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const {authenticateUser} = require("../middlewares/authMiddleware");

router.use(authenticateUser);
router.get('/', async (req, res, next) => {
    try {
        await topicController.getTopics(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        await topicController.getTopicById(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        await topicController.addTopic(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await topicController.deleteTopic(req, res);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
