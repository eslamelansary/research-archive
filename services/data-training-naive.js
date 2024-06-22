var natural = require('natural');
var classifier = new natural.BayesClassifier();

// Using External dataset
const data = require("../dataset/model-data/naiveBayesTrainedData.json");

data.forEach(row => {
    row.values.forEach(value => {
        classifier.addDocument(value.trim().toLowerCase(), row.topic);
    });
});

// Train
classifier.train();
console.log("TrainingDone");
// Persisting /Save
classifier.save('TEST1000Naive.json');