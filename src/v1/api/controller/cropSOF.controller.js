const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const cropSOFModel = require('../model/cropSOFSheet.model');
  const LenderModel = require("../model/lender.model")
  const xlsx = require('xlsx');
  const moment = require('moment');
  const fs = require('fs')
  
// -----------------Sheet Upload Api For Excel Sheet GROW MONEY SOF--------------------------------
// async function growMoneySOF(req, res) {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded.' });
//         }

//         const fileBuffer = fs.readFileSync(req.file.path);
//         const workbook = xlsx.read(fileBuffer, {
//             type: 'buffer',
//             cellDates: true,
//             cellNF: true,
//             cellText: true
//         });

//         if (!workbook || workbook.SheetNames.length === 0) {
//             return res.status(400).json(res,'The uploaded file contains no sheets.');
//         }

//         const sheetName = "Sheet1";
//         if (!workbook.SheetNames.includes(sheetName)) {
//             return badRequest(res,`Sheet "${sheetName}" not found in the workbook.` );
//         }

//         const sheet = workbook.Sheets[sheetName];
//         const data = xlsx.utils.sheet_to_json(sheet);

//         if (!data || data.length === 0) {
//             return badRequest(res,'No data found in the sheet.' );
//         }

//         // Map fields from the Excel sheet to the schema fields
//         const keyMapping = {
//             "State": "state",
//             "Location": "location",
//             "Crop": "crop",
//             "Considered For Kcc(Yes/No)": "consideredForKcc",
//             "New Coc (`/Acres)": "newCocPerAcre",
//             "New Coc For 30% And Kcc Plus v Acres Coc)": "newCocFor30AndKccPlus",
//             "New Yield v": "newYield",
//             "New Market Price (`/Quintal)": "newMarketPricePerQuintal",
//             "New Net Income": "newNetIncome",
//             "Sowing Month": "sowingMonth",
//             "Harvest Month": "harvestMonth",
//             "Duration": "duration"
//         };

//         const transformedData = data.map(item => {
//             const newItem = {};
//             Object.entries(item).forEach(([key, value]) => {
//                 const mappedKey = keyMapping[key];
//                 if (mappedKey) {
//                     if (typeof value === 'string' && value.trim() === '') {
//                         newItem[mappedKey] = null; // Handle empty strings as null
//                     } else if (['newCocPerAcre', 'newCocFor30AndKccPlus', 'newYield', 'newMarketPricePerQuintal', 'newNetIncome'].includes(mappedKey)) {
//                         newItem[mappedKey] = Number(value) || 0; // Parse numerical values
//                     } else {
//                         newItem[mappedKey] = value.toString().trim(); // Default to string values
//                     }
//                 }
//             });
//             return newItem;
//         });

//         const batchSize = 100;
//         const results = { created: 0, updated: 0, failed: 0 };
//         const operations = [];
//         const states = transformedData.map(item => item.state);

//         const existingDocs = await growMoneySOFModel.find({ state: { $in: states } }).select('state').lean();
//         const existingStates = new Set(existingDocs.map(doc => doc.state));

//         transformedData.forEach(item => {
//             if (!item.state) {
//                 results.failed++;
//                 return;
//             }

//             if (existingStates.has(item.state)) {
//                 operations.push({
//                     updateOne: {
//                         filter: { state: item.state },
//                         update: { $set: item },
//                         upsert: false
//                     }
//                 });
//                 results.updated++;
//             } else {
//                 operations.push({
//                     insertOne: {
//                         document: item
//                     }
//                 });
//                 results.created++;
//             }
//         });

//         for (let i = 0; i < operations.length; i += batchSize) {
//             const batch = operations.slice(i, i + batchSize);
//             await growMoneySOFModel.bulkWrite(batch, { ordered: false });
//         }

//         success(res, `File processed successfully: Created: ${results.created}, Updated: ${results.updated}, Failed: ${results.failed}`,
//            {data: transformedData
//         });

//     } catch (error) {
//         console.error('Error processing file:', error);
//         res.status(500).json({ message: 'Internal server error.', error });
//     }
// }
async function cropSOF(req, res) {
    try {
        if (!req.file) {
            return badRequest(res, 'No file uploaded.');
        }

        const fileBuffer = fs.readFileSync(req.file.path);
        const workbook = xlsx.read(fileBuffer, {
            type: 'buffer',
            cellDates: true,
            cellNF: true,
            cellText: true,
        });

        if (!workbook || workbook.SheetNames.length === 0) {
            return badRequest(res,'The uploaded file contains no sheets.');
        }

        const sheetName = "Sheet1";
        if (!workbook.SheetNames.includes(sheetName)) {
            return res.status(400).json({ message: `Sheet "${sheetName}" not found in the workbook.` });
        }

        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            return badRequest(res,'No data found in the sheet.');
        }

        // Map fields from the Excel sheet to the schema fields
        const keyMapping = {
            "State": "state",
            "Location": "location",
            "Crop": "crop",
            "Considered For Kcc(Yes/No)": "consideredForKcc",
            "New Coc (`/Acres)": "newCocPerAcre",
            "New Coc For 30% And Kcc Plus v Acres Coc)": "newCocFor30AndKccPlus",
            "New Yield v": "newYield",
            "New Market Price (`/Quintal)": "newMarketPricePerQuintal",
            "New Net Income": "newNetIncome",
            "Sowing Month": "sowingMonth",
            "Harvest Month": "harvestMonth",
            "Duration": "duration",
        };

        const partnerId = req.body.partnerId;

        if (!partnerId) {
            return badRequest(res, 'partnerId is required in the request body.');
        }

        const transformedData = data.map((item) => {
            const newItem = {};
            Object.entries(item).forEach(([key, value]) => {
                const mappedKey = keyMapping[key];
                if (mappedKey) {
                    if (typeof value === 'string' && value.trim() === '') {
                        newItem[mappedKey] = null; // Handle empty strings as null
                    } else if (
                        [
                            'newCocPerAcre',
                            'newCocFor30AndKccPlus',
                            'newYield',
                            'newMarketPricePerQuintal',
                            'newNetIncome',
                        ].includes(mappedKey)
                    ) {
                        newItem[mappedKey] = Number(value) || 0; // Parse numerical values
                    } else {
                        newItem[mappedKey] = value.toString().trim(); // Default to string values
                    }
                }
            });

            // Add partnerId to each item
            newItem.partnerId = partnerId;

            return newItem;
        });

        const batchSize = 100;
        const results = { created: 0, updated: 0, failed: 0 };
        const operations = [];
        const states = transformedData.map((item) => item.state);

        const existingDocs = await cropSOFModel.find({
            state: { $in: states },
            partnerId: partnerId,
        }).select('state partnerId').lean();

        const existingRecords = new Set(existingDocs.map((doc) => `${doc.state}-${doc.partnerId}`));

        transformedData.forEach((item) => {
            if (!item.state) {
                results.failed++;
                return;
            }

            const recordKey = `${item.state}-${item.partnerId}`;
            if (existingRecords.has(recordKey)) {
                operations.push({
                    updateOne: {
                        filter: { state: item.state, partnerId: item.partnerId },
                        update: { $set: item },
                        upsert: false,
                    },
                });
                results.updated++;
            } else {
                operations.push({
                    insertOne: {
                        document: item,
                    },
                });
                results.created++;
            }
        });

        for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize);
            await cropSOFModel.bulkWrite(batch, { ordered: false });
        }

        return success(res, "File processed successfully: Created: ${results.created}, Updated: ${results.updated}, Failed: ${results.failed}", { data: transformedData});
    } catch (error) {
        console.error('Error details:', error);
        unknownError(res, error);
    } 
}

// ------------------ Get All Grow Money SOF---------------------------------------
    async function getAllCropSOF(req, res) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            errorName: "serverValidation",
            errors: errors.array(),
          });
        }
        const partnerDetail = await LenderModel.findById({_id:new ObjectId(req.query.partnerId)})  
        if(!partnerDetail){
            return notFound(res, "PartnerId Not Found")
        }
       const cropDetail = await cropSOFModel.find({partnerId:new ObjectId(req.query.partnerId)});
        success(res, "Get All Crop SOF",cropDetail);
      } catch (error) {
        console.log(error);
        unknownError(res, error);
      }
    }; 

// -----------------Get Filter Api By location And crop---------------------------
    async function getFilterCropSOF(req, res) {
        try {
          // Validate the incoming request
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({
              errorName: "serverValidation",
              errors: errors.array(),
            });
          }
      
          // Extract query parameters
          const {partnerId, district, crop } = req.query;
          const partnerDetail = await LenderModel.findById({_id:new ObjectId(partnerId)})  
          if(!partnerDetail){
              return notFound(res, "PartnerId Not Found")
          }
          let query = {};
      
          // Check if district is provided and filter by it
          if (district) {
            query.location = district;
             query.partnerId = partnerId;
            // If crop is also provided, add it to the query
            if (crop) {
              query.crop = crop;
            }
          }
      
          // Fetch the filtered data from the database
          const cropSOFDetail = await cropSOFModel.find(query);
      
          // Send the response
          success(res, "Get All Crop SOF", cropSOFDetail);
        } catch (error) {
          console.log(error);
          unknownError(res, error);
        }
      }
      
    //   ------------Get All SOF Data--------------------------------------
    async function getNewFilterCropSOF(req, res) {
        try {
          // Validate the incoming request
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({
              errorName: "serverValidation",
              errors: errors.array(),
            });
          }
      
          // Extract query parameters
          const { partnerId, district, crop } = req.query;
          let query = {};
      
          if (partnerId) {
            // Find partner details if partnerId is provided
            const partnerDetail = await LenderModel.findById(partnerId);
            if (!partnerDetail) {
              return notFound(res, "PartnerId Not Found");
            }
      
            // If partnerUniqueId is "grow123", fetch only that partner's data
            if (partnerDetail.partnerUniqueId === "grow123") {
              query.partnerId = partnerId;
            } else {
              // If partnerUniqueId is not "grow123", check if it exists in DB
              const partnerExists = await LenderModel.findOne({
                partnerUniqueId: partnerDetail.partnerUniqueId,
              });
      
              if (partnerExists) {
                query.partnerId = partnerExists._id;
              } else {
                // If no matching partnerUniqueId, default to "ratna123"
                const defaultPartner = await LenderModel.findOne({
                  partnerUniqueId: "ratna123",
                });
      
                if (!defaultPartner) {
                  return notFound(res, "Default Partner (ratna123) Not Found");
                }
      
                query.partnerId = defaultPartner._id;
              }
            }
          } else {
            // If no partnerId is provided, default to "ratna123"
            const defaultPartner = await LenderModel.findOne({
              partnerUniqueId: "grow123",
            });
      
            // console.log(defaultPartner,"defaultPartnerdefaultPartner")
            if (!defaultPartner) {
              return notFound(res, "Default Partner (ratna123) Not Found");
            }
      
            query.partnerId = defaultPartner._id;
          }
      
          // Apply additional filters
          if (district) {
            query.location = district;
          }
          if (crop) {
            query.crop = crop;
          }
      
          // Fetch the filtered data from the database
          const cropSOFDetail = await cropSOFModel.find(query);
      
          // Send the response
          success(res, "Get Filtered Crop SOF", cropSOFDetail);
        } catch (error) {
          console.log(error);
          unknownError(res, error);
        }
      }

  module.exports = {
      cropSOF,
      getAllCropSOF,
      getFilterCropSOF,
      getNewFilterCropSOF
  }