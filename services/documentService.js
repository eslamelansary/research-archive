const { getRepository } = require('typeorm');
const Topic = require('../entity/Topic');

exports.processDocument = async (filePath) => {
    // Here, you would use an AI model to process the document and determine the topic.
    // For the sake of this example, let's randomly assign a topic.

    const topicRepository = getRepository(Topic);
    const topics = await topicRepository.find();
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    return randomTopic.id;
};
