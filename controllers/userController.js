const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {getRepository} = require('typeorm');
const User = require('../entity/User');

const createUser = async (userData, req, res) => {
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
};

const signup = async (req, res) => {
    const authorData = req.body;
    authorData.role = 'author';
    await createUser(authorData, req, res);
    await signin(req, res);
};

const signin = async (req, res) => {
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

        const token = jwt.sign({userId: user.id, role: user.role}, process.env.SECRET, {expiresIn: '24h'});
        res.status(200).json({message: 'Logged in successfully', user, token});
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

const getUsers = async (req, res) => {
    const userRepository = getRepository(User);
    const users = await userRepository.find({
        relations: ['papers', 'topics']
    });
    res.json(users);
};

const getUserById = async (req, res) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
        where: {id: req.params.id},
        relations: ['papers', 'topics']
    });
    res.json(user);
};

const updateUser = async (req, res) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
        where: {id: req.params.id}
    });
    userRepository.merge(user, req.body);
    await userRepository.save(user);
    res.json({message: 'User updated successfully'});
};

const deleteUser = async (req, res) => {
    const userRepository = getRepository(User);

    // Find the user by ID
    const user = await userRepository.findOne({
        where: {id: req.params.id}
    });

    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }

    // Delete the user
    await userRepository.delete(user.id);
    res.json({message: 'User deleted successfully'});
};

const getUserWhere = async (req, res) => {
    const userRepository = getRepository(User);
    const user = await userRepository.find({
        where: { role: req.params.role },
        relations: ['papers', 'topics']
    });
    res.json(user);
}

module.exports = {
    signup,
    signin,
    getUsers,
    getUserWhere,
    getUserById,
    updateUser,
    deleteUser,
    createUser
}