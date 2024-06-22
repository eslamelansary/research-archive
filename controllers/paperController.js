const {getRepository, Between} = require('typeorm');
const User = require('../entity/User');
const Paper = require('../entity/Paper');
const Counter = require('../entity/Counter');
const paperRepository = getRepository(Paper);
const userRepository = getRepository(User);
const counterRepository = getRepository(Counter);

const paperStatus = {
    DOWNLOADED: 'downloaded',
    PENDING: 'pending review',
    ACCEPTED: 'accepted',
    REVIEWED: 'reviewed'
}

const uploadPaper = async (req, res) => {
    try {
        // Check if a file was uploaded
        const file = req.file;
        if (!file) {
            return res.status(400).json({message: 'No file uploaded'});
        }

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
            status: paperStatus.PENDING,
            minimum_reviewers: +requestBody?.body || 1
        });
        await paperRepository.save(paper);
        res.status(201).json({message: 'Paper uploaded successfully'});
    } catch (error) {
        console.error('Error uploading paper:', error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

const assignPaperToReviewer = async (req, res) => {
    const {userId, paperId} = req.body;
    const user = await userRepository.findOne({
        where: {
            id: +userId
        },
        relations: ['papers']
    });
    const exception = req.body.exception;
    if (user && user.role === 'reviewer') {
        const isExistingPaper = user.papers.find(p => p.id === paperId);
        if (isExistingPaper) {
            return res.status(422).json({message: 'paper already assigned to this reviewer!'});
        }
        if (user.papers.length >= 3 && exception == false) {
            return res.status(422).json({message: "You can not assign more than 3 papers to a user or Add an exception."})
        }
        const paper = await paperRepository.findOne({where: {id: +paperId}});
        user.papers.push(paper);
        await getRepository(User).save(user);
        res.status(201).json({message: "Assigned successfully"});
    } else {
        res.status(422).json({message: 'User is not a reviewer or does not exist.'});
    }
}

const getAllPapers = async (req, res) => {
    const papers = await paperRepository.find({
        relations: ['users']
    });
    res.json(papers);
};

const getPaperById = async (req, res) => {
    const paper = await paperRepository.findOne({
        where: {id: +req.params.id},
        relations: ['users']
    });
    res.json(paper);
};

const addComment = async (req, res) => {
    const paperId = +req.params.id;
    const userId = req.user.userId;
    const comment = req.body;

    const user = await userRepository.findOne({where: {id: userId}});
    if (user?.role !== 'reviewer')
        return res.status(422).json({message: 'You cannot add a comment'});

    const paper = await paperRepository.findOne({
        select: {id: true, comments: true},
        where: {id: paperId}
    });

    if (!paper) {
        return res.status(404).json({message: "Paper not found"});
    }

    const counter = await counterRepository.count();
    paper.comments = paper.comments || [];
    paper.comments.push({
        id: counter + 1,
        comment,
        userId: user.id,
        username: user.username,
        createdAt: new Date(),
    });
    await paperRepository.save(paper);
    await counterRepository.insert({});
    res.status(201).json({message: "Comment added"})
};

const deleteComment = async (req, res) => {
    const {paperId, commentId} = req.params;
    const paper = await paperRepository.findOne({where: {id: +paperId}});

    if (!paper) {
        return res.status(404).json({message: 'Paper not found'});
    }

    paper.comments = paper.comments || [];
    paper.comments = paper.comments.filter(c => c.id !== +commentId);

    await paperRepository.save(paper);
};

const findInDay = async (req, res) => {
    const date = new Date(req.body.date);
    const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

    const papers = await paperRepository.find({
        where: {
            createdAt: Between(startOfDay, endOfDay),
        }
    });

    res.status(200).json(papers);
}

const takeAction = async (req, res) => {
    const user = await userRepository.findOneBy({id: req.user.userId});
    if (user.role === 'reviewer') {
        const action = req.params.action;
        if (action === 'accept'){
            const paper = paperRepository.findOneBy({id: +req.body.paperId});
        }
    } else {
        res.status(422).json({message: "You cannot take action on paper!"});
    }
}

module.exports = {
    uploadPaper,
    assignPaperToReviewer,
    getAllPapers,
    getPaperById,
    addComment,
    deleteComment,
    findInDay,
    takeAction
}