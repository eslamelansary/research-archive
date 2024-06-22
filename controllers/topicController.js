const {getRepository} = require("typeorm");
const Topic = require("../entity/Topic");
const User = require("../entity/User");

const add = async (req, res) => {
    const { name } = req.body;
    const topicRepository = getRepository(Topic);

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
    const topicRepository = getRepository(Topic);

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
    const topicRepository = getRepository(Topic);
    const topics = await topicRepository.find();
    res.json(topics);
}

const assignTopicToReviewer = async (req, res) => {
    const {userId, topicIds} = req.body;
    const user = await getRepository(User).findOne({
        where: {
            id: userId
        },
        relations: ['topics']
    });

    if (user && user.role === 'reviewer') {
        for(const id of topicIds) {
            const topic = await getRepository(Topic).findOne({ where: { id } })
            user.topics.push(topic);
        }
        await getRepository(User).save(user);
        res.status(201).json({message: "Assigned successfully"});
    } else {
        res.status(422).json({message: 'User is not a reviewer or does not exist.'});
    }
}


module.exports = {
    add,
    deleteTopic,
    findAll,
    assignTopicToReviewer,
}