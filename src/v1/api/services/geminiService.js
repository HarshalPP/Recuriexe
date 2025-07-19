const  {geminiModel , geminiFileModel} = require("../../../../config/geminiConfig.js");
const  axios = require("axios")
const  { badRequest } = require("../../../../globalHelper/response.globalHelper.js");

const fs = require("fs");
const { readFileSync, writeFileSync } = require("fs");
const  path = require("node:path");
const mime = require('mime-types');

 const generateAIResponse = async (prompt) => {
  try {
    const jsonEnforcedPrompt = `${prompt}\n\nReturn the response strictly in valid JSON format. Do not include any text outside the JSON.`;

    const result = await geminiModel.generateContent(jsonEnforcedPrompt);

    console.log("result---",result)
    
    let responseText = result?.response?.text?.() || "{}"; 
    responseText = responseText.replace(/```json|```/g, "").trim();

    // 🛠️ Attempt JSON parsing
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.warn("⚠️ AI Response is not valid JSON. Returning as text.");
      return { text: responseText }; // Return text instead of failing
    }
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    throw new Error("Failed to generate AI response.");
  }
};




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


 const generateAIResponseWithBase64 = async (prompt, base64Image, mimeType) => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };

    const result = await geminiModel.generateContent([prompt, imagePart]);

    if (!result || !result.response) {
      throw new Error("No response available.");
    }

    let responseText = result.response.text?.() || "{}"; // Default to empty JSON object if empty
    console.log("Raw AI Response:", responseText);

    // 🛠️ Remove unnecessary markdown formatting
    responseText = responseText.replace(/```json|```/g, "").trim();

    // 🛠️ Parse the cleaned JSON string
    const jsonResponse = JSON.parse(responseText);

    return jsonResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI response.");
  }
};


// Function to send public image URL to Gemini

// Function to fetch and convert a PDF file to Base64
const fetchFileAsBase64 = async (fileUrl) => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });
    // Convert file buffer to Base64
    return Buffer.from(response.data).toString("base64");
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Error("Failed to fetch the file from URL");
  }
};

// Function to send Base64 PDF to Gemini API
//  const generateAIResponseWithImageUrl = async (prompt, fileUrl) => {
//   try {

//     // Convert file to Base64
//     const base64File = await fetchFileAsBase64(fileUrl);

//     // Prepare request for Gemini API
//     const result = await geminiFileModel.generateContent([
//       {
//         inlineData: {
//           mimeType: "application/pdf", // Ensure correct MIME type
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
//     throw new Error("Failed to generate AI response.");
//   }
// };


const generateAIResponseWithImageUrl = async (prompt, fileUrl) => {
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

// for AI Screeenting //

 const generateAIScreening = async (prompt, fileUrl) => {

  try {
        const mimeType = mime.lookup(fileUrl) || "application/octet-stream";
    const base64File = await fetchFileAsBase64(fileUrl);


    const result = await geminiFileModel.generateContent([
      {
        inlineData: {
          mimeType, // Dynamically assigned MIME type
          data: base64File,
        },
      },
      prompt,
    ]);

    if (!result || !result.response) {
      throw new Error("No response available.");
    }

    let responseText = result.response.text?.() || "{}"; // Default to empty JSON object if response is empty

    responseText = responseText.replace(/```json|```/g, "").trim();


    const jsonResponse = JSON.parse(responseText);
    console.log("AI Screening Response:", jsonResponse);

    return jsonResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
     return error
  }
};

module.exports = {
    generateAIResponse,
    generateAIResponseWithBase64,
    generateAIResponseWithImageUrl,
    generateAIScreening,
    fetchFileAsBase64,
  };
