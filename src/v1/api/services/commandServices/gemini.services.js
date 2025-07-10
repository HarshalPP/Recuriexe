// import {geminiModel , geminiFileModel} from "../config/gemini.config.js";
// import axios from "axios"
// import mime from 'mime-types';
// import * as fs from "node:fs";
// import path from "node:path";

// // export const generateAIResponse = async (prompt) => {
// //   try {
// //     const jsonEnforcedPrompt = `${prompt}

// // Return the response strictly in valid JSON format. Do not include any text outside the JSON. Do NOT wrap the JSON inside triple backticks (\`\`\`json ... \`\`\`). Only return pure JSON.`;

// //     const result = await geminiFileModel.generateContent(jsonEnforcedPrompt);

// //     let responseText = result?.response?.text?.() || "{}";
// //     // console.log("Raw AI Response:", responseText);

// //     // 🛠️ Remove unwanted Markdown JSON markers (```json ... ```)
// //     responseText = responseText.replace(/```json|```/g, "").trim();

// //     // 🛠️ Ensure only valid JSON is extracted (regex to find `{...}` or `[...]`)
// //     const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
// //     if (jsonMatch) {
// //       responseText = jsonMatch[0].trim();
// //     } else {
// //       console.warn("⚠️ No valid JSON found in response. Returning as text.");
// //       return { text: responseText };
// //     }

// //     // 🛠️ Attempt JSON parsing
// //     try {
// //       return JSON.parse(responseText);
// //     } catch (error) {
// //       console.warn("⚠️ AI Response is not valid JSON. Returning as text.");
// //       return { text: responseText }; // Return text instead of failing
// //     }
// //   } catch (error) {
// //     console.error("❌ Gemini API Error:", error);
// //     throw new Error("Failed to generate AI response.");
// //   }
// // };








// const fileToGenerativePart = (filePath, mimeType) => {
//   if (!fs.existsSync(filePath)) {
//     throw new Error(`File not found: ${filePath}`);
//   }
//   return {
//     inlineData: {
//       data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
//       mimeType,
//     },
//   };
// };


// export const generateAIResponseWithBase64 = async (prompt, base64Image, mimeType) => {
//   try {
//     const imagePart = {
//       inlineData: {
//         data: base64Image,
//         mimeType,
//       },
//     };

//     const result = await geminiModel.generateContent([prompt, imagePart]);

//     if (!result || !result.response) {
//       throw new Error("No response available.");
//     }

//     let responseText = result.response.text?.() || "{}"; // Default to empty JSON object if empty
//     // console.log("Raw AI Response:", responseText);

//     // 🛠️ Remove unnecessary markdown formatting
//     responseText = responseText.replace(/```json|```/g, "").trim();

//     // 🛠️ Parse the cleaned JSON string
//     const jsonResponse = JSON.parse(responseText);

//     return jsonResponse;
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     throw new Error("Failed to generate AI response.");
//   }
// };


// // Function to send public image URL to Gemini

// // Function to fetch and convert a PDF file to Base64
// const fetchFileAsBase64 = async (fileUrl) => {
    
//   try {
//     const response = await axios.get(fileUrl, {
//       responseType: "arraybuffer",
//     });
    
//     // Convert file buffer to Base64
//     return Buffer.from(response.data).toString("base64");
//   } catch (error) {
//     console.error("Error fetching file:", error);
//     throw new Error("Failed to fetch the file from URL");
//   }
// };

// // Function to send Base64 PDF to Gemini API
// export const generateAIResponseWithImageUrl = async (prompt, fileUrl) => {

//   try {

//         // Determine the MIME type from the file extension
//         const mimeType = mime.lookup(fileUrl) || "application/octet-stream";

//     // Convert file to Base64
//     const base64File = await fetchFileAsBase64(fileUrl);

//     // Prepare request for Gemini API
//     const result = await geminiFileModel.generateContent([
//       {
//         inlineData: {
//           mimeType, // Dynamically assigned MIME type
//           data: base64File,
//         },
//       },
//       prompt,
//     ]);

//     if (!result || !result.response) {
//       throw new Error("No response available.");
//     }

//     let responseText = result.response.text?.() || "{}"; // Default to empty JSON object if response is empty
//     // 🛠️ Remove unnecessary markdown formatting
//     responseText = responseText.replace(/```json|```/g, "").trim();

//     // 🛠️ Parse the cleaned JSON string
//     const jsonResponse = JSON.parse(responseText);

//     return jsonResponse;
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//      return error
//   }
// };






// // const formatResponse = (text) => {
// //   const lines = text.split("\n").filter((line) => line.trim() !== "");

// //   let formattedData = {};
// //   let currentSection = "";

// //   lines.forEach((line) => {
// //     if (line.startsWith("**")) {
// //       currentSection = line.replace(/\*\*/g, "").trim();
// //       formattedData[currentSection] = "";
// //     } else if (currentSection) {
// //       formattedData[currentSection] += line.trim() + " ";
// //     }
// //   });

// //   return formattedData;
// // };




import { geminiModel, geminiFileModel, geminiProUpdated } from "../../config/gemini.config.js";
import axios from "axios";
import mime from "mime-types";
import * as fs from "node:fs";
import path from "node:path";

const fileToGenerativePart = (filePath, mimeType) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
};

// ✅ Supports multiple base64 images
export const generateAIResponseWithBase64 = async (prompt, base64Images, mimeType) => {
  try {
    const imageParts = base64Images.map(base64Image => ({
      inlineData: {
        data: base64Image,
        mimeType,
      },
    }));

    const result = await geminiProUpdated.generateContent([prompt, ...imageParts]);

    if (!result || !result.response) {
      throw new Error("No response available.");
    }

    let responseText = result.response.text?.() || "{}";
    responseText = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response.");
  }
};

// Helper: Fetch file from URL and return base64
const fetchFileAsBase64 = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data).toString("base64");
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Error("Failed to fetch the file from URL");
  }
};

// ✅ Supports array of image URLs
export const generateAIResponseWithImageUrl = async (prompt, fileUrls) => {
  try {
    const imageParts = await Promise.all(
      fileUrls.map(async (url) => {
        const mimeType = mime.lookup(url) || "application/octet-stream";
        const base64File = await fetchFileAsBase64(url);
        return {
          inlineData: {
            mimeType,
            data: base64File,
          },
        };
      })
    );

    const result = await geminiProUpdated.generateContent([prompt, ...imageParts]);
    
    if (!result || !result.response) {
      throw new Error("No response available.");
    }

    let responseText = result.response.text?.() || "{}";
    responseText = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return error;
  }
};
