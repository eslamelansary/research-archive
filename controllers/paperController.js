const {getRepository} = require('typeorm');
const fs = require('fs');
const path = require('path');
const Topic = require('../entity/Topic');
const User = require('../entity/User');
const Paper = require('../entity/Paper');

exports.uploadPaper = async (req, res) => {
    try {
        // Check if a file was uploaded
        const file = req.file;
        if (!file) {
            return res.status(400).json({message: 'No file uploaded'});
        }

        // Retrieve necessary repositories
        const paperRepository = getRepository(Paper);
        const topicRepository = getRepository(Topic);
        const userRepository = getRepository(User);

        // Extract data from request body
        const requestBody = req.body;
        const {topicId} = requestBody;

        // Find topic and user
        const topic = await topicRepository.findOne(topicId);
        const user = await userRepository.findOne({id: req.user.id, role: 'author'});

        // Check if topic and user exist
        if (!topic || !user) {
            return res.status(400).json({message: 'Invalid topic or user'});
        }

        // Save paper details to the database
        const now = new Date();
        const paper = new paperRepository.create({
                name: file.originalname.name,
                createdAt: now
            }
        );
        await paperRepository.save(paper);

        // Move file to 'to-be-processed' directory
        const processedFileName = `${file.originalname}-tobeprocessed.txt`;
        const processedFilePath = path.join('to-be-processed', processedFileName);
        fs.renameSync(file.path, processedFilePath);

        res.status(201).json({message: 'Paper uploaded successfully'});
    } catch (error) {
        console.error('Error uploading paper:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};
