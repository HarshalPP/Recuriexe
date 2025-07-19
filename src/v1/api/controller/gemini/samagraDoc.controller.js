const { generateAIResponse , generateAIResponseWithBase64 , generateAIResponseWithImageUrl } = require("../../services/geminiService.js");

const mongoose =  require("mongoose");
const {
  success,
  badRequest,
  unknownError,
} = require("../../../../../globalHelper/response.globalHelper.js");



// Get Prompt for cibil credit report //

 const { samargraPrompt } = require("../../prompt/samagraDoc.prompt.js");




// Genertate AI with Image URL //
   const generateAIWithImageUrl = async (req, res) => {
    try {
      const { prompt: userPrompt,type, imageUrl } = req.body; 
  
      if (!imageUrl) {
        return badRequest(res, "Image URL not provided");
      }
  
        // Generate system prompt using the reusable function
        const finalPrompt = samargraPrompt(userPrompt);
      const aiResponse = await generateAIResponseWithImageUrl(finalPrompt, imageUrl);
      return success(res, `Family Detail Of ${type} `, aiResponse);
    } catch (error) {
      console.error("Error:", error);
      return unknownError(res, "Internal server error",error);
    }
  };
  
module.exports = {
    generateAIWithImageUrl
}

