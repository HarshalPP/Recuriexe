
const {
    badRequest,
    parseJwt,
    success,
    unknownError,
    unauthorized,
  } = require("../../../../../globalHelper/response.globalHelper");

  const collectionModel = require('../../model/collection/collectionSheet.model')
const visitModel = require('../../model/collection/visit.model')

// Helper function to get the start and end of today
function getTodayRange() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  
    return { startOfDay, endOfDay };
  }
  
   async function collectionNews(req, res){
    try {
      const { startOfDay, endOfDay } = getTodayRange();
  
      // Top 5 employees by total receivedAmount from collectionModel
      const topCollections = await collectionModel.aggregate([
        {
          $match: {
            status: "accept",
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: "$collectedBy",
            totalAmount: { $sum: "$receivedAmount" },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
      ]);
  
      // Top 5 employees by visit count from visitModel
      const topVisits = await visitModel.aggregate([
        {
          $match: {
            status: "accept",
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: "$visitBy",
            visitCount: { $sum: 1 },
          },
        },
        { $sort: { visitCount: -1 } },
        { $limit: 5 },
      ]);
  
      return success(res, "Top Collection And Visit" , {data: {
          topCollections,
          topVisits}},);
    } catch (error) {
      console.error(error);
      return unknownError("Internal Server Error" , error.message);
    }
  }


module.exports = {
    collectionNews
}