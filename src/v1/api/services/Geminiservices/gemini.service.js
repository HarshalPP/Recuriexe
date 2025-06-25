import { geminiModel, geminiFileModel } from "../../config/geminiConfig.js"
import axios from "axios";
import { badRequest } from "../../formatters/globalResponse.js"
import fs, { readFileSync, writeFileSync } from "fs";
import path from "node:path";
import mime from "mime-types";

// Function to generate AI response based on prompt
export const generateAIResponse = async (prompt) => {
  try {
    const jsonEnforcedPrompt = `${prompt}\n\nReturn the response strictly in valid JSON format. Do not include any text outside the JSON.`;

    const result = await geminiModel.generateContent(jsonEnforcedPrompt);

    let responseText = result?.response?.text?.() || "{}"; 
    responseText = responseText.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.warn("⚠️ AI Response is not valid JSON. Returning as text.");
      return { text: responseText };
    }
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    throw new Error("Failed to generate AI response.");
  }
};

// Helper function to convert file to generative part
export const fileToGenerativePart = (filePath, mimeType) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return {
    inlineData: {
      data: Buffer.from(readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
};

// Function to generate AI response with base64 image
export const generateAIResponseWithBase64 = async (prompt, base64Image, mimeType) => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const result = await geminiFileModel.generateContent([prompt, imagePart]);

    if (!result || !result.response) {
      throw new Error("No response available.");
    }

    let responseText = result.response.text?.() || "{}";
    console.log("Raw AI Response:", responseText);

    responseText = responseText.replace(/```json|```/g, "").trim();
    const jsonResponse = JSON.parse(responseText);

    return jsonResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response.");
  }
};

// Function to fetch file from URL and convert to Base64
export const fetchFileAsBase64 = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    return Buffer.from(response.data).toString("base64");
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Error("Failed to fetch the file from URL");
  }
};

// Function to generate AI response with an image or PDF file URL
export const generateAIResponseWithImageUrl = async (prompt, fileUrl) => {
  try {
    const base64File = await fetchFileAsBase64(fileUrl);

    const fileExtension = fileUrl.split('.').pop().toLowerCase();
    let mimeType;

    if (fileExtension === 'pdf') {
      mimeType = "application/pdf";
    } else if (['jpg', 'jpeg', 'jpe'].includes(fileExtension)) {
      mimeType = "image/jpeg";
    } else if (fileExtension === 'png') {
      mimeType = "image/png";
    } else if (fileExtension === 'gif') {
      mimeType = "image/gif";
    } else if (fileExtension === 'webp') {
      mimeType = "image/webp";
    } else if (fileExtension === 'tiff' || fileExtension === 'tif') {
      mimeType = "image/tiff";
    } else {
      console.log(`Unknown file extension: ${fileExtension}, defaulting to image/jpeg`);
      mimeType = "image/jpeg";
    }

    console.log(`Processing file of type: ${mimeType}`);

    const result = await geminiFileModel.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64File,
        },
      },
      prompt,
    ]);

    if (!result || !result.response) {
      throw new Error("No response available.");
    }

    let responseText = result.response.text?.() || "{}";
    responseText = responseText.replace(/```json|```/g, "").trim();

    try {
      const jsonResponse = JSON.parse(responseText);
      return jsonResponse;
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      console.log("Raw response from Gemini:", responseText);

      let extractedNumber = "";

      const aadharMatch = responseText.match(/\b\d{12}\b/);
      if (aadharMatch) {
        extractedNumber = aadharMatch[0];
      } else {
        const panMatch = responseText.match(/\b[A-Z]{5}\d{4}[A-Z]\b/i);
        if (panMatch) {
          extractedNumber = panMatch[0];
        }
      }

      if (extractedNumber) {
        return {
          status: true,
          extractedNumber: extractedNumber
        };
      }

      return {
        status: false,
        extractedNumber: "",
        message: "Could not extract number from response",
        rawResponse: responseText.substring(0, 200)
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response: " + (error.message || "Unknown error"));
  }
};






// Function for AI screening using a document URL
export const generateAIScreening = async (prompt, fileUrl) => {
  try {
    console.log("fileUrl" , fileUrl)
    const mimeType = mime.lookup(fileUrl) || "application/octet-stream";
    const base64File = await fetchFileAsBase64(fileUrl);

    const result = await geminiModel.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64File,
        },
      },
      prompt,
    ]);

    if (!result || !result.response) {
      throw new Error("No response available.");
    }

    let responseText = result.response.text?.() || "{}";
    responseText = responseText.replace(/```json|```/g, "").trim();

    const jsonResponse = JSON.parse(responseText);
    // console.log("AI Screening Response:", jsonResponse);

    return jsonResponse;
  } catch (error) {
    return error;
  }
};



// extract resume data // 
export const extractCandidateDataFromResume = async (resumeUrl) => {
  try {
    const prompt = `
You are an intelligent resume parser.

From the resume provided, extract and return the following fields in JSON format:

- name (full name)
- emailId (email address)
- mobileNumber (10-digit mobile number)
- pincode (if present)

Return response in the EXACT JSON format shown below:
{
  "name": "Candidate Name",
  "emailId": "example@example.com",
  "mobileNumber": "9876543210",
  "pincode": "400001"
}
`;

    const extractedData = await generateAIScreening(prompt, resumeUrl);

    if (!extractedData?.name || !extractedData?.emailId) {
      console.warn("Incomplete data extracted:", extractedData);
      return null;
    }

    return extractedData;

  } catch (error) {
    console.error("Resume parsing failed:", error.message);
    return null;
  }
};








