const {getRepository} = require("typeorm");
const Topic = require("../entity/Topic");

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

module.exports = {
    add, deleteTopic, findAll
}