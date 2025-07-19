// const {
//     success,
//     unknownError,
//     serverValidation,
//     badRequest,
//   } = require("../../../../../globalHelper/response.globalHelper");
  
//   const { validationResult } = require("express-validator");
//   const mongoose = require("mongoose");
//   const ObjectId = mongoose.Types.ObjectId;
//   const landerTypeModel = require("../../model/adminMaster/landerType.model");
//   const landerModel = require("../../model/adminMaster/lander.model")
//   const bcrypt = require('bcrypt')
//   const {landerGoogleSheet} = require('./masterGoogleSheet.controller')
  
//   // ------------------------Admin Master Add lander---------------------------------------
//   async function landerAdd(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           errorName: "serverValidation",
//           errors: errors.array(),
//         });
//       }
//       let fieldsToProcess = ['fullName','landerName', 'email'];
//       fieldsToProcess.forEach(field => {
//         if (req.body[field]) {
//           req.body[field] = req.body[field].toLowerCase().trim();
//         }
//       });
//       const landerDetail = new landerModel(req.body);
//       // console.log('landerDetail', landerDetail, 'landerDetail')
//       const existinglander = await landerModel.findOne({ userName: landerDetail.userName });
//       if (existinglander) {
//         return badRequest(res, "UserName already exists");
//       }
//       if (!req.body.landerType || req.body.landerType.trim() === "") {
//         return badRequest(res, "lander Type is required")
//       }
//       const landerType = await landerTypeModel.findById({ _id: landerDetail.landerType })
//       if (!landerType) {
//         return badRequest(res, "lander Type Not Found")
//       }
  
//       const salt = await bcrypt.genSalt(10)
//       password = await bcrypt.hash(landerDetail.password, salt);
//       landerDetail.password = await bcrypt.hash(req.body.password, salt)
  
//       const landerData = await landerDetail.save()
//       console.log('landerDetail', landerData)
//       success(res, "lander Added Successful", landerDetail);
//       await landerGoogleSheet(landerDetail)
  
//     } catch (error) {
//       console.log(error);
//       unknownError(res, error);
//     }
//   };
  
//   // ------------------Admin Master Update  lander ---------------------------------------
//   async function landerUpdate(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           errorName: "serverValidation",
//           errors: errors.array(),
//         });
//       }
//       const { landerId , ...updateFields} = req.body;
//       const landerExist = await landerModel.findById(landerId)
//         if(!landerExist){
//           return badRequest(res, "lander Not Found")
//         }
//       let fieldsToProcess = ['fullName','userName','companyName','communicationMailId', 'email', 'address','communicationToMailId','communicationCcMailId'];
//       fieldsToProcess.forEach(field => {
//         if (req.body[field]) {
//           updateFields[field] = req.body[field].toLowerCase().trim();
//         }
//       });
//       const updateData = await landerModel.findByIdAndUpdate(landerId, updateFields, { new: true });
//       success(res, "Updated lander Detail", updateData);
//       await landerGoogleSheet(updateData)
//     } catch (error) {
//       console.log(error);
//       unknownError(res, error);
//     }
//   };
  
//   // ------------------Admin Master Get lander By Id---------------------------------------
//   async function landerById(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           errorName: "serverValidation",
//           errors: errors.array(),
//         });
//       }
//       const landerDetail = await landerModel.aggregate([
//         { $match: { _id: new ObjectId(req.params.landerId) } },
//         {
//           $lookup: {
//             from: "landertypes",
//             localField: "landerType",
//             foreignField: "_id",
//             as: "landerTypeDetail"
//           }
//         },
//         {
//           $project: {
//             "landerTypeDetail.__v": 0, "landerTypeDetail.createdAt": 0, "landerTypeDetail.updatedAt": 0
//           }
//         }
//       ]);
  
//       success(res, "Get lander Detail", landerDetail);
//     } catch (error) {
//       console.log(error);
//       unknownError(res, error);
//     }
//   };
  
//   // ------------------Admin Master Get All lander Detail---------------------------------------
  
//   async function getAllLander(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           errorName: "serverValidation",
//           errors: errors.array(),
//         });
//       }
//       const landerType = req.query.role;
//       let landerDetail = await landerModel.aggregate([
//         {$match:{status:"active"} },
//         {
//           $lookup: {
//             from: "landertypes",
//             localField: "landerType",
//             foreignField: "_id",
//             as: "landerTypeDetail"
//           }
//         },
//         {
//           $project: {
//             "landerTypeDetail.__v": 0, "landerTypeDetail.createdAt": 0, "landerTypeDetail.updatedAt": 0
//           }
//         }
//       ]);
//       if (landerType) {
//         const role = landerType.toLowerCase()
//         landerDetail = landerDetail.filter(lander => lander.landerTypeDetail[0].landerType === role);
//         return success(res, `Get All ${role} list`, { count: landerDetail.length, landerDetail });
//       } else {
//         return success(res, "Get All lander list", landerDetail);
//       }
//     } catch (error) {
//       console.log(error);
//       unknownError(res, error);
//     }
//   };
  
//   async function landerActiveOrInactive(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
//         } else {
//             const  id = req.body.id;
//             const status = req.body.status
//             if (!id || id.trim() === "") {
//               return badRequest(res , "ID is required and cannot be empty");
//           }
//           if (!mongoose.Types.ObjectId.isValid(id)) {
//             return badRequest(res , "Invalid ID");
//           }
//             if (status == "active") {
//                 const landerUpdateStatus =  await landerModel.findByIdAndUpdate({ _id:id}, { status: "active"},{new:true})
//             success(res, "lander Active" ,landerUpdateStatus);
//             }
//            else if (status == "inactive") {
//             const landerUpdateStatus =  await landerModel.findByIdAndUpdate({ _id:id}, { status:"inactive"},{new:true})
//             success(res, "lander inactive" ,landerUpdateStatus);
//             }
//             else{
//                 return badRequest(res, "Status must be 'active' or 'inactive'");
//             }
           
//         }
//     } catch (error) {
//         console.log(error);
//         unknownError(res, error);
//     }
//   }
  
  
//   module.exports = {
//     landerAdd,
//     landerUpdate,
//     landerById,
//     getAllLander,
//     landerActiveOrInactive
//   };
  