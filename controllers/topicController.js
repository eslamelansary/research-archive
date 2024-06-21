// const {getRepository} = require("typeorm");
// const User = require("../entity/User");
// const bcrypt = require("bcryptjs");
//
// async function createUser(userData, req, res) {
//     const userRepository = getRepository(User);
//     const {username, password, role} = userData;
//     // Check if the username already exists
//     const existingUser = await userRepository.findOne({where: {username}});
//     if (existingUser) {
//         return res.status(400).json({message: 'Username already exists'});
//     }
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     // Create the user
//     const newUser = userRepository.create({username, password: hashedPassword, role});
//     await userRepository.save(newUser);
//
//     // res.status(201).json({message: 'User created successfully'});
//     await signin(req, res);
// }
//
//
// const deleteUser = async (req, res) => {
//     const userRepository = getRepository(User);
//
//     // Find the user by ID
//     const user = await userRepository.findOne({
//         where: {id: req.params.id}
//     });
//
//     if (!user) {
//         return res.status(404).json({message: 'User not found'});
//     }
//
//     // Delete the user
//     await userRepository.delete(user.id);
//     res.json({message: 'User deleted successfully'});
// };