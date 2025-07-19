const data = require('../../../../word2vec_model.json');


// Function to load the JSON file containing word vectors
function loadWordVectors() {
    return JSON.parse(data);
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
}

// Main function to demonstrate usage
function main() {
    // Load the word vectors from the JSON file
    const wordVectors = data

    // Get vectors for specific words
    const word1 = 'management';
    const word2 = 'loan';
    const vector1 = wordVectors[word1];
    const vector2 = wordVectors[word2];

    if (!vector1 || !vector2) {
        console.error(`One of the words ('${word1}' or '${word2}') is not in the model.`);
        return;
    }

    // Calculate cosine similarity
    const similarity = cosineSimilarity(vector1, vector2);
    console.log(`Cosine similarity between '${word1}' and '${word2}': ${similarity}`);
}

// Run the main function
main();



async function chatBot(message) {
    return data
}

module.exports={
    chatBot
}