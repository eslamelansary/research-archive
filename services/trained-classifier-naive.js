const natural = require("natural");

function loadClassifierAsync(filePath) {
    return new Promise((resolve, reject) => {
        natural.BayesClassifier.load(filePath, null, (err, classifier) => {
            if (err) {
                reject(err);
            } else {
                resolve(classifier);
            }
        });
    });
}

async function decideTopic(sentences) {
    try {
        let hashMap = new Map();
        
        // Load the classifier asynchronously
        const classifier = await loadClassifierAsync("naiveBayesTrainedData.json");

        // Classify each sentence and update the map
        for (let line of sentences) {
            let classificationResult = classifier.classify(line); 
            if (hashMap.has(classificationResult)) {
                let value = hashMap.get(classificationResult);
                value++;
                hashMap.set(classificationResult, value); 
            } else {
                hashMap.set(classificationResult, 1);
            }
        }
        // hashmap contains the topics and w zaharao kam mara 

        // Calculate percentages
        let allCounts = 0; //total values of topics
        let classificationResult = Array.from(hashMap).map(([key, value]) => ({ key, value }));
        
        for (let entry of classificationResult) {
            allCounts += entry.value;
        }

        for (let entry of classificationResult) {
            entry.percentage = (entry.value / allCounts) * 100;
        }
         
        // Find the topic with the highest percentage
        let highestPercentageObject = classificationResult.reduce((prev, current) => 
            (prev.percentage > current.percentage) ? prev : current);

        return highestPercentageObject;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = { decideTopic };
