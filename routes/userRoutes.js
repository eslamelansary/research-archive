const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authenticateUser} = require("../middlewares/authMiddleware");

router.post('/signup', async (req, res, next) => {
    try {
        await userController.signup(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/signin', async (req, res, next) => {
    try {
        await userController.signin(req, res);
    } catch (error) {
        next(error);
    }
});

router.use(authenticateUser);
router.post('/create', async (req, res, next) => {
    try {
        await userController.createUser(req.body, req, res);
        res.status(201).json({message: "User created successfully"})
    } catch (error) {
        next(error);
    }
});

router.get('/roles/:role', async (req, res, next) => {
    try {
        await userController.getUserWhere(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        await userController.getUsers(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        await userController.getUserById(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        await userController.updateUser(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await userController.deleteUser(req, res);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
