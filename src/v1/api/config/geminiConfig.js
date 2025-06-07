import { GoogleGenerativeAI } from "@google/generative-ai";
import "../config/db.js"; // Ensure file path is correct and uses .js extension for ESM

const geminiApiKey = process.env.GEMINI_KEY;
const googleAI = new GoogleGenerativeAI(geminiApiKey);

const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

// GEMINI FLASH MODEL
const geminiModel = googleAI.getGenerativeModel({
  // model: "gemini-1.5-flash",
  model: "gemini-2.5-flash-preview-04-17",
  ...geminiConfig,
});

// GEMINI PRO MODEL (for file input like images/PDFs)
const geminiFileModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  ...geminiConfig,
});

export { geminiModel, geminiFileModel };
