
const {
    serverValidation,
    success,
    notFound,
    badRequest ,unknownError} = require('../../../../../globalHelper/response.globalHelper');

const  { generateAIResponse } = require("../../services/geminiService");

    
 const getAIResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
    return badRequest(res , 'Please provide the Prompt')
    }

    const response = await generateAIResponse(prompt);
   return success(res , "Featch data" , response)
  } catch (error) {
    return unknownError(res , 'Internal Server Error')
  }
};


module.exports = {
    getAIResponse
  };
