const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const natural = require("natural");
const { WordNet } = natural;

// Promisify fs.readFile for better handling of file reading
const readFileAsync = promisify(fs.readFile);

// Load the English stopwords for natural language processing
const stopwords = require("stopwords").english;

// Function to remove common words from a sentence
const additionalWordsToRemove = [`remove`, `do`, `can`, `be`, `a`, 'did'];

// Initialize WordNet
const wordnet = new WordNet();

// Function to lemmatize a word
async function lemmatizeWord(word) {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    wordnet.lookup(word, (results) => {
      if (results && results.length > 0) {
        resolve(results[0].lemma);
      } else {
        // If no lemma found, return the original word
        resolve(word);
      }
    });
  });
}

// Function to remove common words from a sentence using lemmatization
async function removeStopwords(sentence, additionalWordsToRemove = []) {
  const stopwordsToExclude = [...stopwords, ...additionalWordsToRemove];
  const words = sentence.split(" ");
  const refinedWords = [];

  for (let word of words) {
    // Check if the word contains numeric characters
    if (!/\d/.test(word)) {
      // Lemmatize the word
      const lemmatizedWord = await lemmatizeWord(word.toLowerCase());
      if (!stopwordsToExclude.includes(lemmatizedWord)) {
        refinedWords.push(word);
      }
    }
  }

  return refinedWords.join(" ");
}

// Function to read and process text from a text file
async function processTextFile(filePath) {
  try {
    const data = await readFileAsync(filePath, "utf8");
    const lowerCaseData = data.toLowerCase(); // Convert text to lowercase
    const lines = lowerCaseData.split("\n"); // Split by newline characters
    return await sentecesToClassify(lines);
  } catch (err) {
    console.error("Error reading the text file:", err);
  }
}

// Function to read and process text from a docx file
async function processDocxFile(filePath) {
  try {
    const { value } = await mammoth.extractRawText({ path: filePath });
    const lowerCaseData = value.toLowerCase(); // Convert text to lowercase
    const lines = lowerCaseData.split("\n"); // Split by newline characters
    return await sentecesToClassify(lines);
  } catch (err) {
    console.error("Error reading the docx file:", err);
  }
}

async function sentecesToClassify(lines) {
  // Process each line
  const refinedSentences = [];
  lines.forEach((line) => {
    const sentences = line.split(/[.!?,]/); // Split each line into sentences
    sentences.forEach((sentence) => {
      if (sentence.trim() !== "" || sentence.trim() !== " ") {
        // Exclude empty sentences
        refinedSentences.push(sentence.trim()); // Trim whitespace
      }
    });
  });

  // Remove common words from each sentence
  const finalSentences = await Promise.all(
    refinedSentences.map(
      async (sentence) =>
        await removeStopwords(sentence, additionalWordsToRemove)
    )
  );
  return finalSentences;
}

// Function to read and process text from a pdf file
async function processPdfFile(filePath) {
  try {
    const data = await readFileAsync(filePath);
    const pdfData = await pdf(data);
    const lowerCaseData = pdfData.text.toLowerCase(); // Convert text to lowercase
    const lines = lowerCaseData.split("\n"); // Split by newline characters
    return sentecesToClassify(lines);
  } catch (err) {
    console.error("Error reading the pdf file:", err);
  }
}

async function refine() {
  const filePath = "services/classifier/dataset/testArticle.txt";

  // Determine file type and call appropriate function
  const fileExt = path.extname(filePath).toLowerCase();
  switch (fileExt) {
    case ".txt":
      return await processTextFile(filePath);
    case ".docx":
      return await processDocxFile(filePath);
    case ".pdf":
      return await processPdfFile(filePath);
    default:
      console.error("Unsupported file format.");
      return [];
  }
}
module.exports = { refine };
