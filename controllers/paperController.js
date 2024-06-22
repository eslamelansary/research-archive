const {getRepository} = require('typeorm');
const User = require('../entity/User');
const Paper = require('../entity/Paper');

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

        if (!user) {
            return res.status(400).json({message: 'Invalid topic or user'});
        }

        const now = new Date();
        const paper = paperRepository.create({
            name: file.originalname,
            createdAt: now,
            updatedAt: now,
            filePath: file.originalname,
            topic: null,
            authorId: user.id,
            authorName: user.username,
            status: paperStatus.PENDING
        });
        await paperRepository.save(paper);
        res.status(201).json({message: 'Paper uploaded successfully'});
    } catch (error) {
        console.error('Error uploading paper:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

const assignPaperToReviewer = async (req, res) => {
    const { userId, paperId } = req.body;
    const user = await getRepository(User).findOne({
        where: {
            id: userId
        },
        relations: ['papers']
    });

    if (user && user.role === 'reviewer') {
        const paper = await getRepository(Paper).findOne({ where: { id: paperId } });
        user.papers.push(paper);
        await getRepository(User).save(user);
        res.status(201).json({message: "Assigned successfully"});
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