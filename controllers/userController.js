const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {getRepository} = require('typeorm');
const User = require('../entity/User');
const Reviewer = require('../entity/Reviewer');

async function createUser(userData, req, res) {
    const userRepository = getRepository(User);
    const {username, password, role} = userData;
    // Check if the username already exists
    const existingUser = await userRepository.findOne({where: {username}});
    if (existingUser) {
        return res.status(400).json({message: 'Username already exists'});
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the user
    const newUser = userRepository.create({username, password: hashedPassword, role});
    await userRepository.save(newUser);
    // If the user's role is "reviewer", create a corresponding Reviewer entry
    if (role === 'reviewer') {
        const reviewerRepository = getRepository(Reviewer);
        const newReviewer = reviewerRepository.create({userId: newUser.id});
        await reviewerRepository.save(newReviewer);
    }
    res.status(201).json({message: 'User created successfully'});
}

exports.signup = async (req, res) => {
    await createUser(req.body, req, res);
};

exports.signin = async (req, res) => {
    const userRepository = getRepository(User);
    const {username, password} = req.body;

    try {
        const user = await userRepository.findOne({
            select:{ id: true, username: true, password: true, role: true },
            where: {username}
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const token = jwt.sign({userId: user.id, role: user.role}, process.env.SECRET, {expiresIn: '1h'});
        res.status(200).json({message: 'Logged in successfully', token});
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

exports.getUsers = async (req, res) => {
    const userRepository = getRepository(User);
    const users = await userRepository.find();
    res.json(users);
};

exports.getUserById = async (req, res) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
        where: {id: req.params.id}
    });
    res.json(user);
};

exports.updateUser = async (req, res) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
        where: {id: req.params.id}
    });
    userRepository.merge(user, req.body);
    await userRepository.save(user);
    res.json({message: 'User updated successfully'});
};

exports.deleteUser = async (req, res) => {
    const userRepository = getRepository(User);
    const reviewerRepository = getRepository(Reviewer);

    // Find the user by ID
    const user = await userRepository.findOne({
        where: {id: req.params.id}
    });

    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }

    // If the user is a reviewer, delete the corresponding reviewer entry
    if (user.role === 'reviewer') {
        await reviewerRepository.delete({userId: user.id});
    }

    // Delete the user
    await userRepository.delete(user.id);
    res.json({message: 'User deleted successfully'});
};

exports.getUserWhere = async (req, res) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
        where: {role: req.body.role}
    });
    res.json(user);
}