const {getRepository} = require('typeorm');
const Reviewer = require('../entity/Reviewer');
const User = require('../entity/User');
const Topic = require('../entity/Topic');

exports.getReviewers = async (req, res) => {
    const reviewerRepository = getRepository(Reviewer);
    const reviewers = await reviewerRepository.find({ relations: ['user'] });
    res.json(reviewers);
};

exports.getReviewerById = async (req, res) => {
    const reviewerRepository = getRepository(Reviewer);
    const reviewer = await reviewerRepository.findOne({
        where: { userId: req.params.id },
        relations: ['user']
    });
    res.json(reviewer);
};

exports.updateReviewer = async (req, res) => {
    const reviewerRepository = getRepository(Reviewer);
    const reviewer = await reviewerRepository.findOne({
        where: {userId: req.params.id}
    });
    reviewerRepository.merge(reviewer, req.body);
    await reviewerRepository.save(reviewer);
    res.json({message: 'Reviewer updated successfully'});
};

exports.deleteReviewer = async (req, res) => {
    const reviewerRepository = getRepository(Reviewer);
    const userRepository = getRepository(User);
    // Find the reviewer by ID
    const reviewer = await reviewerRepository.findOne({
        where: { userId: req.params.id }
    });

    if (!reviewer) {
        return res.status(404).json({message: 'Reviewer not found'});
    }

    // Delete the reviewer
    await reviewerRepository.delete(reviewer.id);
    await userRepository.delete(reviewer.userId);

    res.json({message: 'Reviewer deleted successfully'});
};

exports.getMyTopics = async (req, res) => {
    const userId = req.user.id;
    const topicRepository = getRepository(Topic);
    
    const topics = await topicRepository.find({
        where: {userId: userId},
    });
    res.json(topics);
}
