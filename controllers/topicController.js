const {getRepository} = require("typeorm");
const Topic = require("../entity/Topic");
const User = require("../entity/User");
const topicRepository = getRepository(Topic);
const userRepository = getRepository(User);

const add = async (req, res) => {
    const { name } = req.body;
    if(name.length == 0 ){
        return res.status(422).json({message: "Invalid topic name"});
    }

    // Check if the topicname already exists
    const existingTopic = await topicRepository.findOne({
        where: { name }
    });

    if (existingTopic) {
        return res.status(400).json({message: 'Topic name already exists'});
    }

    const newTopic = topicRepository.create({ name });
    await topicRepository.save(newTopic);
    res.status(201).json({message: 'Topic added successfully'});
}

const deleteTopic = async (req, res) => {
    // Find the topic by ID
    const topic = await topicRepository.findOne({
        where: {id: req.params.id}
    });

    if (!topic) {
        return res.status(404).json({message: 'Topic name not found'});
    }

    // Delete the topic
    await topicRepository.delete(topic.id);
    res.json({message: 'Topic deleted successfully'});
};

const findAll = async (req, res) => {
    const topics = await topicRepository.find({
        relations: ['users']
    });
    res.json(topics);
}

const assignTopicToReviewer = async (req, res) => {
    const {userId, topicIds} = req.body;
    const user = await userRepository.findOne({
        where: {
            id: userId
        },
        relations: ['topics']
    });
    // ALREADY ASSIGNED TOPIC
    if (user && user.role === 'reviewer') {
        for(const id of topicIds) {
            const topic = await topicRepository.findOne({ where: { id } })
            user.topics.push(topic);
        }
        await userRepository.save(user);
        res.status(201).json({message: "Assigned successfully"});
    } else {
       return res.status(422).json({message: 'User is not a reviewer or does not exist.'});
    }
}

const reviewersEachTopic = async (req, res) => {
    const topics = await topicRepository.find({
        select: { users: true },
        relations: ['users'],
    });

    const transformedTopics = topics.map(topic => ({
        id: topic.id,
        name: topic.name,
        users: topic.users.length
    }));
    res.json(transformedTopics);
}

// ADD TOPICS TO ME (reviewer)

module.exports = {
    add,
    deleteTopic,
    findAll,
    assignTopicToReviewer,
    reviewersEachTopic
}