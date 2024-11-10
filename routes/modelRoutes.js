const express = require("express");
const router = express.Router();
const {authenticateUser} = require("../middlewares/authMiddleware");
const {processData} = require("../services/data-reader-from-excel");
const classifier = require("../services/data-refiner-before-classifying");
const {decideTopic} = require('../services/classifier.service')

router.use(authenticateUser);
router.post('/read-from-excel', async (req, res, next) => {
    try {
        await processData();
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const textData = await classifier.refine();
        const topic = await decideTopic(textData);
        res.send(topic);
    } catch (error) {
        next(error);
    }
})

module.exports = router;
