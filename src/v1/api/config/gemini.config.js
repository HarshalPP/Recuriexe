import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();


// const client = new MongoClient(process.env.MONGO_URI);
// client.connect();

// const db = client.db("fincoopers-live");

const geminiApiKey = process.env.GEMINI_KEY;
const googleAI = new GoogleGenerativeAI(geminiApiKey);

const geminiConfig = {
  temperature: 0,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096
};

// GEMINI FLASH MODEL // 
export const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Use a lighter model
  geminiConfig,
});


// GEMINI PRO MODEL //
// File-based generative AI model (for images/videos)
export const geminiFileModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-pro", // Ensure the model supports file input
  geminiConfig,
});


export const geminiPro = googleAI.getGenerativeModel({
  model: "gemini-1.5-pro", // Ensure the model supports file input
  geminiConfig,
});



export const geminiProUpdated = googleAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17", // Ensure the model supports file input
  geminiConfig,
});
