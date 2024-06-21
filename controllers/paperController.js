const {getRepository} = require('typeorm');
const fs = require('fs');
const path = require('path');
const User = require('../entity/User');
const Paper = require('../entity/Paper');
const Paper_Reviewer = require("../entity/Paper_Reviewer");

const paperStatus = {
    DOWNLOADED: 'downloaded',
    PENDING: 'pending review',
    REVIEWED: 'reviewed'
}

const uploadPaper = async (req, res) => {
    try {
        // Check if a file was uploaded
        const file = req.file;
        if (!file) {
            return res.status(400).json({message: 'No file uploaded'});
        }

        // Retrieve necessary repositories
        const paperRepository = getRepository(Paper);
        const userRepository = getRepository(User);

        // Extract data from request body
        const requestBody = req.body;
        // Find topic and user
        const user = await userRepository.findOne({
            where: {
                id: req.user.userId,
                role: 'author'
            }
        });

        // Check if topic and user exist
        if (!user) {
            return res.status(400).json({message: 'Invalid topic or user'});
        }

        console.log("hello")
        // Save paper details to the database
        const now = new Date();
        const paper = paperRepository.create({
            name: file.originalname,
            createdAt: now,
            updatedAt: now,
            filePath: file.originalname,
            topic: null,
            authorId: user.id,
            status: paperStatus.PENDING
        });
        await paperRepository.save(paper);

        // Move file to 'to-be-processed' directory
        const processedFileName = `${file.originalname}-tobeprocessed.txt`;
        const processedFilePath = path.join('to-be-processed', processedFileName);
        // fs.renameSync(file.path, processedFilePath);

        res.status(201).json({message: 'Paper uploaded successfully'});
    } catch (error) {
        console.error('Error uploading paper:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

const assignPaperToReviewer = async (req, res) => {
    const {userId, paperId} = req.body;
    const user = await getRepository(User).findOne({
        where: {
            id: userId
        }
    });

    if (user && user.role === 'reviewer') {
        // Create a new assignment
        const assignment = {
            assignedAt: new Date()
        }
        assignment.reviewer = user;
        assignment.paper = await getRepository(Paper).findOne({
            where: {
                id: paperId
            }
        });

        await getRepository(Paper_Reviewer).save(assignment);
        res.status(201).json({message: "assigned successfully"});
    } else {
        res.status(422).json({message: 'User is not a reviewer or does not exist.'});
    }
}

const getAllPapers = async (req, res) => {
    const paperRepository = getRepository(Paper);
    const papers = await paperRepository.find();
    res.json(papers);
};

const getPaperById = async (req, res) => {
    const paperRepository = getRepository(Paper);
    const paper = await paperRepository.findOne({
        where: {id: req.params.id}
    });
    res.json(paper);
};

module.exports = {
    uploadPaper,
    assignPaperToReviewer,
    getAllPapers,
    getPaperById
}