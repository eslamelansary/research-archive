const {getRepository, Between} = require('typeorm');
const path = require('path');
const User = require('../entity/User');
const Paper = require('../entity/Paper');
const Counter = require('../entity/Counter');
const classifier = require("../services/data-refiner-before-classifying");
const {decideTopic} = require("../services/classifier.service");
const paperRepository = getRepository(Paper);
const userRepository = getRepository(User);
const counterRepository = getRepository(Counter);

const paperStatus = {
    DOWNLOADED: 'downloaded',
    PENDING: 'pending review',
    ACCEPTED: 'accepted',
    REVIEWED: 'reviewed',
    REJECTED: 'rejected',
}

const uploadPaper = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({message: 'No file uploaded'});
        }

        const paperCheck = await paperRepository.find({
            where: {
                name: file.originalname
            },
            orWhere: {
                filePath: file.originalname
            }
        })

        if (paperCheck.length)
            return res.status(422).json({message: "This paper already exists in our records!"});

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
        const textData = await classifier.refine(file.path);
        const topic = await decideTopic(textData);
        const paper = paperRepository.create({
            name: file.originalname,
            createdAt: now,
            updatedAt: now,
            filePath: file.originalname,
            topic: topic?.key || null,
            authorId: user.id,
            authorName: user.username,
            status: paperStatus.PENDING,
            minimum_reviewers: 2
        });
        await paperRepository.save(paper);
        return res.status(201).json({message: 'Paper uploaded successfully'});
    } catch (error) {
        console.error('Error uploading paper:', error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
};

const downloadPaper = async (req, res) => {
    const fileName = req.body.fileName;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    res.download(filePath, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            return res.status(404).send('File not found');
        }
    });
}

const assignPaperToReviewer = async (req, res) => {
    const {userId, paperId} = req.body;
    const user = await userRepository.findOne({
        where: {
            id: +userId
        },
        relations: ['papers']
    });
    if (user && user.role === 'reviewer') {
        const paper = await paperRepository.findOne({
            where: {id: +paperId},
            relations: ['users']
        });

        if (paper.status === paperStatus.REVIEWED)
            return res.status(422).json({message: 'You cannot assign an already reviewed paper to a reviewer!'});

        if (paper.users.length == 3) {
            return res.status(422).json({message: 'You cannot assign a paper to more than 3 reviewers!'});
        }

        const isExistingPaper = user.papers.find(p => p.id === paperId);
        if (isExistingPaper) {
            return res.status(422).json({message: 'paper already assigned to this reviewer!'});
        }

        // if (user.papers.length >= 3) {
        //     return res.status(422).json({message: "You can not assign more than 3 papers to a user or Add an exception."})
        // }

        paper.status = paperStatus.PENDING;
        paper.updatedAt = new Date();
        await paperRepository.save(paper);
        user.papers.push(paper);
        user.total_assigned++;
        await userRepository.save(user);
        return res.status(201).json({message: "Assigned successfully"});
    } else {
        return res.status(422).json({message: 'User is not a reviewer or does not exist.'});
    }
}

const getAllPapers = async (req, res) => {
    const userId = req.user.userId;
    const topicName = req?.body?.topicName;
    const date = req?.body?.date ? new Date(req?.body?.date) : null; //2024-02-05
    const where = {};
    if (date) {
        const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
        where['createdAt'] = Between(startOfDay, endOfDay);
    }

    if (topicName) {
        const papers = await paperRepository.find({
            where,
            relations: ['users']
        });

        const userPapers = papers.filter(paper =>
            paper.users.some(user => user.id == userId)
        )

        const hasTopic = userPapers.some(paper => paper.topic === topicName);

        if (!hasTopic) {
            return res.status(400).json({message: `The user does not have access to the topic: ${topicName}`});
        }

        const filteredPapers = userPapers.filter(paper => paper.topic == topicName);
        return res.json(filteredPapers);

    } else {
        const user = await userRepository.findOne({
            where: {id: userId},
            relations: ['papers', 'topics']
        });

        if (user.role === 'reviewer') {
            const papers = await paperRepository.find({
                where,
                relations: ['users']
            });

            if (papers.length > 0) {
                const myPapers = papers.filter(paper =>
                    paper.users.some(user => user.id === userId)
                );
                return res.json(myPapers);
            }
            return res.json([]);
        }

        const papers = await paperRepository.find({
            where,
            relations: ['users']
        });

        return res.json(papers);
    }
};

const getPaperById = async (req, res) => {
    const paper = await paperRepository.findOne({
        where: {id: +req.params.id},
        relations: ['users']
    });
    return res.json(paper);
};

const getTopicsNumber = async (req, res) => {
    const result = await paperRepository
        .createQueryBuilder()
        .select('topic')
        .addSelect('COUNT(id)', 'count')
        .groupBy('topic')
        .getRawMany();
    return res.status(200).json(result);
}

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
    return res.status(201).json({message: "Comment added"})
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

const takeAction = async (req, res) => {
    const user = await userRepository.findOneBy({id: req.user.userId});
    if (user.role === 'reviewer') {
        const action = req.params.action;
        const paperId = +req.body.paperId;
        const paper = await paperRepository.findOne({
            where: {id: paperId},
            relations: ['users']
        });
        if (!paper) {
            return res.status(404).json({message: 'paper not found'});
        }
        if (paper.status === paperStatus.REVIEWED)
            return res.status(422).json({message: 'This paper has been reviewed!'});
        const myPaper = paper.users.find(user => user.id === req.user.userId);
        if (myPaper) {
            if (action === 'accept') {
                if (
                    (paper.status == paperStatus.PENDING)
                ) {
                    await paperRepository.save(paper);
                    return res.status(201).json({message: "Accepted successfully!"});
                } else {
                    return res.status(422).json({message: 'You cannot accept already accepted OR reviewed paper!'});
                }
            }

            if (action === 'download') {
                return res.status(201).json({message: "Downloaded successfully!"});
            }

            if (action === 'review') {
                if (paper.status != paperStatus.REVIEWED || paper.accepting_reviewers.length + paper.rejecting_reviewers.length > 3) {
                    if(paper.accepting_reviewers.find(u => u.user_id == user.id) || paper.rejecting_reviewers.find(u => u.user_id == user.id) ){
                        return res.status(422).json({message: "You have already reviewed this paper before!"});
                    }
                    paper.accepting_reviewers = paper.accepting_reviewers || []
                    paper.accepting_reviewers.push({user_id: user.id, username: user.username});
                    user.total_accepted++;
                    await userRepository.save(user);
                    await paperRepository.save(paper);
                    if (paper.accepting_reviewers.length == paper.minimum_reviewers || paper.accepting_reviewers.length + paper.rejecting_reviewers.length == 3) {
                        paper.status = paperStatus.REVIEWED;
                        await paperRepository.save(paper);
                    }

                    if(paper.accepting_reviewers.length == 1 && paper.rejecting_reviewers.length == 1) {
                        return res.status(422).json({message: "Reviewed successfully but now you should ask the editor to assign a third reviewer!"});
                    }

                    return res.status(201).json({message: "Reviewed successfully!"});
                } else {
                    return res.status(422).json({message: 'you can only mark a paper reviewed if only it is unreviewed!'});
                }
            }

            if (action === 'reject') {
                if (paper.status == paperStatus.PENDING || paper.status == paperStatus.ACCEPTED || paper.accepting_reviewers.length + paper.rejecting_reviewers.length > 3) {
                    if(paper.accepting_reviewers.find(u => u.user_id == user.id) || paper.rejecting_reviewers.find(u => u.user_id == user.id) ){
                       return res.status(422).json({message: "You have already reviewed this paper before!"});
                    }
                    paper.rejecting_reviewers = paper.rejecting_reviewers || []
                    paper.rejecting_reviewers.push({user_id: user.id, username: user.username});
                    user.total_rejected++;
                    await userRepository.save(user)
                    await paperRepository.save(paper);
                    if (paper.rejecting_reviewers.length == paper.minimum_reviewers || paper.accepting_reviewers.length + paper.rejecting_reviewers.length == 3) {
                        paper.status = paperStatus.REJECTED;
                        await paperRepository.save(paper);
                    }

                    if(paper.accepting_reviewers.length == 1 && paper.rejecting_reviewers.length == 1) {
                        return res.status(422).json({message: "Reviewed successfully but now you should ask the editor to assign a third reviewer!"});
                    }
                    return res.status(201).json({message: "Rejected successfully!"});
                } else {
                    return res.status(422).json({message: `This paper has been already reviewed and it is already ${paperStatus.REJECTED}`});
                }
            }

        } else {
            return res.status(422).json({message: "you cannot take action on paper assigned to another reviewer!"});
        }
    } else {
        return res.status(422).json({message: "You cannot take action on paper!"});
    }
}

module.exports = {
    uploadPaper,
    downloadPaper,
    assignPaperToReviewer,
    getAllPapers,
    getPaperById,
    addComment,
    deleteComment,
    takeAction,
    getTopicsNumber,
}