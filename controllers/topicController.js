const {getRepository} = require("typeorm");
const Topic = require("../entity/Topic");
const bcrypt = require("bcryptjs");


const add = async (req, res) => {
    const topicRepository = getRepository(Topic);

    // Check if the topicname already exists
    const existingTopic = await topicRepository.findOne({ where: { name } });
    if (existingTopic) {
        return res.status(400).json({message: 'Topic name already exists'});
    }

    const newTopic = topicRepository.create({ name });
    await topicRepository.save(newTopic);

    // res.status(201).json({message: 'Topic created successfully'});
    await signin(req, res);
}

const delete = async (req, res) => {
    const topicRepository = getRepository(Topic);

    // Find the topic by ID
    const topic = await topicRepository.findOne({
        where: {id: req.params.id}
    });

    if (!topic) {
        return res.status(404).json({message: 'Topic not found'});
    }

    // Delete the topic
    await topicRepository.delete(topic.id);
    res.json({message: 'Topic deleted successfully'});
};

module.exports = {
    add, delete
}