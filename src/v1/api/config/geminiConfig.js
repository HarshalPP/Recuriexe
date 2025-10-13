import { GoogleGenerativeAI } from "@google/generative-ai";
import "../config/db.js";

const apiKey = process.env.GEMINI_KEY; // ensure this is set
const genAI = new GoogleGenerativeAI(apiKey);

// shared config
const generationConfig = {
  temperature: 0.3,
  topP: 0.8,
  topK: 10,
  maxOutputTokens: 4096,
};

// Flash: best price/latency
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig,
});

// Pro: use this when you need long context or to send PDFs/images
export const geminiFileModel = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig,
});
