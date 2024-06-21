const {getRepository} = require('typeorm');
const Topic = require('../entity/Topic');
const Reviewer = require('../entity/Reviewer');

exports.getTopics = async (req, res) => {
    const topicRepository = getRepository(Topic);
    const topics = await topicRepository.find({relations: ['reviewer']});
    res.json(topics);
};

exports.getTopicById = async (req, res) => {
    const topicRepository = getRepository(Topic);
    const topic = await topicRepository.findOne({
        where: {id: req.params.id}, relations: ['reviewer']
    });
    res.json(topic);
};

exports.addTopic = async (req, res) => {
    const topicRepository = getRepository(Topic);
    const reviewerRepository = getRepository(Reviewer);

    // Extract necessary data from request body
    const {userId, name, description} = req.body;

    // Create a new topic entity
    const topic = topicRepository.create({userId, name, description});

    // Save the topic entity
    await topicRepository.save(topic);

    // Retrieve the corresponding reviewer
    const reviewer = await reviewerRepository.findOne({where: {userId}});

    if (reviewer) {
        // Increment the assignedTopicsCounter
        reviewer.assignedPapersCount += 1;
        await reviewerRepository.save(reviewer);
    } else {
        console.log(`Reviewer with userId ${userId} not found.`);
    }

    res.status(201).json({message: 'Topic added successfully'});
};

exports.deleteTopic = async (req, res) => {
    const topicRepository = getRepository(Topic);
    const reviewerRepository = getRepository(Reviewer);

    // Retrieve the topic entity to be deleted
    const topic = await topicRepository.findOne({where: {id: req.params.id}});

    if (!topic) {
        return res.status(404).json({message: 'Topic not found'});
    }

    // Delete the topic entity
    await topicRepository.remove(topic);

    // Decrement the assignedTopicsCounter for the corresponding reviewer
    const reviewer = await reviewerRepository.findOne({where: {userId: topic.userId}});

    if (reviewer) {
        reviewer.assignedPapersCount -= 1;
        await reviewerRepository.save(reviewer);
    } else {
        console.log(`Reviewer with userId ${topic.userId} not found.`);
    }

    res.json({message: 'Topic deleted successfully'});
};
