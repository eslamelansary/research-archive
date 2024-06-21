const {getRepository} = require("typeorm");
const Topic = require("../entity/Topic");
const bcrypt = require("bcryptjs");


const add = async(name) {
    const topicRepository = getRepository(Topic);
    const {topicname, password, role} = topicData;
    // Check if the topicname already exists
    const existingTopic = await topicRepository.findOne({where: {topicname}});
    if (existingTopic) {
        return res.status(400).json({message: 'Topicname already exists'});
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the topic
    const newTopic = topicRepository.create({topicname, password: hashedPassword, role});
    await topicRepository.save(newTopic);

    // res.status(201).json({message: 'Topic created successfully'});
    await signin(req, res);
}

const deleteTopic = async (req, res) => {
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