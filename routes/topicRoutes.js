const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const topicController = require("../controllers/topicController");

router.use(authenticateUser);
router.post('/', async (req, res, next) => {
    try {
        await topicController.add(req, res);
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

router.get('/', async (req, res, next) => {
    try {
        await topicController.findAll(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/assign-reviewer', async (req, res, next) => {
    try {
        await topicController.assignTopicToReviewer(req, res)
    } catch (error) {
        next(error);
    }
})

module.exports = router;
