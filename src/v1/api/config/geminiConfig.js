import { GoogleGenerativeAI } from "@google/generative-ai";
import "../config/db.js"; // Ensure file path is correct and uses .js extension for ESM


// const geminiConfig = {
//   temperature: 0.9,
//   topP: 1,
//   topK: 1,
//   maxOutputTokens: 4096,
// };

const geminiApiKey = process.env.GEMINI_KEY;
const googleAI = new GoogleGenerativeAI(geminiApiKey);

const geminiConfig = {
temperature: 0.3, // Lower temperature for faster, more consistent responses
  topP: 0.8,        // Reduced for faster processing
  topK: 10,         // Reduced significantly for speed
  maxOutputTokens: 4096,
};

// GEMINI FLASH MODEL
const geminiModel = googleAI.getGenerativeModel({
  // model: "gemini-1.5-flash",
  model: "gemini-1.5-flash",
  ...geminiConfig,
});

// GEMINI PRO MODEL (for file input like images/PDFs)
const geminiFileModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  ...geminiConfig,
});

export { geminiModel, geminiFileModel };
