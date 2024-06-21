const express = require("express");
const router = express.Router();
const {authenticateUser} = require("../middlewares/authMiddleware");
const topicController = require("../controllers/topicController");

router.use(authenticateUser);
router.post('/create', async (req, res, next) => {
    try {
        await topicController.add(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await topicController.delete(req, res);
    } catch (error) {
        next(error);
    }
});
