const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const moment = require("moment");
  const scrollingTextModel = require("../../model/adminMaster/scrollingText.model");
  const processModel = require("../../model/process.model")
  const visitModel = require("../../model/collection/visit.model")
  const collectionModel = require("../../model/collection/collectionSheet.model")
  const externalVendorDynamicModel = require("../../model/externalManager/externalVendorDynamic.model")

  // ------------------Admin Master Scorlling Notification Add---------------------------------------
  async function scrollingTextAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const tokenId = new ObjectId(req.Id);
      req.body.employeeId = tokenId;
      if (req.body.title) {
        req.body.title = req.body.title;
      }
      const data = await scrollingTextModel.findOne({title:req.body.title})
      if(data){
         return badRequest(res, "Title Already Present") 
      }
      const textDetail = await scrollingTextModel.create(req.body);
     
      success(res, "Text Notification Added Successful", textDetail);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Scorlling Notification  "active" to  "inactive"(DELETE)---------------------------------------
  async function scrollingTextDelete(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          const { textId } = req.body;
          if (!textId || textId.trim() === "") {
              return badRequest(res , "ScrollingText Id is required and cannot be empty");
          }
          if (!mongoose.Types.ObjectId.isValid(textId)) {
            return badRequest(res , "Invalid ID");
          }
          const scrollingTextDetail = await scrollingTextModel.findById({ _id: new ObjectId(textId) });
          if (!scrollingTextDetail) {
            return badRequest(res, "textId  Not Found");
          }

           const data =  await scrollingTextModel.findByIdAndDelete({ _id:textId})
            success(res, "Scrolling Text Delete" ,data);

        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update  Scorlling Notification ---------------------------------------
  async function updateScrollingText(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { ScrollingTextId, ...updateFields } = req.body;
      if (typeof updateFields.ScrollingText === 'string') {
        updateFields.ScrollingText = updateFields.ScrollingText.trim().toLowerCase();
      }

      if (!ScrollingTextId || ScrollingTextId.trim() === "") {
        return badRequest(res, "Please Select ScrollingTextId");
      }
  
      const scrollingTexttail = await scrollingTextModel.findById({ _id: new ObjectId(ScrollingTextId) });
      if (!scrollingTexttail) {
        return badRequest(res, "ScrollingTextId  Not Found");
      }

      const updateData = await scrollingTextModel.findByIdAndUpdate(ScrollingTextId, updateFields, {new :true});
      success(res, "Updated Scorlling Notification",updateData);

    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // ------------------Admin Master Get All Scorlling Notification---------------------------------------
  async function getAllScrollingText(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let  scrollingText = await scrollingTextModel.find({status:"active"});
      
      success(res, "Get All Scrolling Text Notification",scrollingText);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  

  // --------------Get All Finexe Detail Login, Pd, visit, collection

  // async function getAllScrollingNotification(req, res) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(400).json({
  //         errorName: "serverValidation",
  //         errors: errors.array(),
  //       });
  //     }
  //     const todayDateString = moment().format("YYYY-MM-DD");
    
  //     // Fetch active scrolling text notifications
  //     // let scrollingText = await scrollingTextModel.find({ status: "active" }, { _id: 1, title: 1 });
  
  //     // Fetch employees for visitDone condition (updatedAt matches current date)
  //     const visitDoneEmployees = await visitModel.aggregate([
  //       {
  //         $match: {
  //           status: "accept",
  //           createdAt: {
  //             $gte: new Date(`${todayDateString}T00:00:00.000Z`),
  //             $lt: new Date(`${todayDateString}T23:59:59.999Z`),
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           // Extract the unique ID part after the hyphen
  //           employeeUniqueNumber: {
  //             $arrayElemAt: [
  //               { $split: ["$visitBy", "-"] },
  //               1
  //             ]
  //           }
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "employees",
  //           let: { uniqueId: "$employeeUniqueNumber" },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $eq: ["$employeUniqueId", "$$uniqueId"]
  //                 }
  //               }
  //             }
  //           ],
  //           as: "employeeDetails",
  //         },
  //       },
  //       { $unwind: "$employeeDetails" },
  //       {
  //         $lookup: {
  //           from: "newbranches",
  //           localField: "employeeDetails.branchId",
  //           foreignField: "_id",
  //           as: "branchDetails",
  //         },
  //       },
  //       { $unwind: "$branchDetails" },
  //       {
  //         $project: {
  //           text: {
  //             $toUpper: {
  //             $concat: [
  //               "Visit Done By:- ",
  //               "$employeeDetails.employeName",
  //               " (BRANCH:- ",
  //               "$branchDetails.name",
  //               ")"
  //             ],
  //           },
  //           },
  //           type: { $literal: "visit" },
  //         },
  //       },
  //     ]);
  

  //     // Fetch employees for emiReceived condition (updatedAt matches current date)
  //     const emiReceivedEmployees = await collectionModel.aggregate([
  //       {
  //         $match: {
  //           status: "accept",
  //           createdAt: {
  //             $gte: new Date(`${todayDateString}T00:00:00.000Z`),
  //             $lt: new Date(`${todayDateString}T23:59:59.999Z`),
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           // Extract the unique ID part after the hyphen
  //           employeeUniqueNumber: {
  //             $arrayElemAt: [
  //               { $split: ["$collectedBy", "-"] },
  //               1
  //             ]
  //           }
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "employees",
  //           let: { uniqueId: "$employeeUniqueNumber" },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $eq: ["$employeUniqueId", "$$uniqueId"]
  //                 }
  //               }
  //             }
  //           ],
  //           as: "employeeDetails",
  //         },
  //       },
  //       { $unwind: "$employeeDetails" },
  //       {
  //         $lookup: {
  //           from: "newbranches",
  //           localField: "employeeDetails.branchId",
  //           foreignField: "_id",
  //           as: "branchDetails",
  //         },
  //       },
  //       { $unwind: "$branchDetails" },
  //       {
  //         $project: {
  //           text: {
  //             $toUpper: {
  //             $concat: [
  //               "Emi Received By:-",
  //               "$employeeDetails.employeName",
  //               " (BRANCH:- ",
  //               "$branchDetails.name",
  //               ")"
  //             ],
  //           },
  //           },
  //           type: { $literal: "emi" },
  //         },
  //       },
  //     ]);
 
  //     // Combine all scrolling text messages
  //     let combinedScrollingText = [
  //       // ...scrollingText.map((item) => ({ _id: item._id, text: item.title.toUpperCase() ,type: 'notification'})),
  //       ...visitDoneEmployees,
  //       ...emiReceivedEmployees

  //     ];
  
  //     return success(res, "Get All Scrolling Text Notification", combinedScrollingText);
  //   } catch (error) {
  //     console.log(error);
  //     unknownError(res, error);
  //   }
  // }
  
  async function getAllScrollingNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { startDate, endDate } = req.query;
  
      const start = startDate
        ? new Date(`${startDate}T00:00:00.000Z`)
        : new Date(moment().format("YYYY-MM-DDT00:00:00.000Z"));
  
      const end = endDate
        ? new Date(`${endDate}T23:59:59.999Z`)
        : new Date(moment().format("YYYY-MM-DDT23:59:59.999Z"));
  
      const visitDoneEmployees = await visitModel.aggregate([
        {
          $match: {
            status: "accept",
            createdAt: { $gte: start, $lt: end },
          },
        },
        {
          $addFields: {
            employeeUniqueNumber: {
              $arrayElemAt: [{ $split: ["$visitBy", "-"] }, 1],
            },
          },
        },
        {
          $lookup: {
            from: "employees",
            let: { uniqueId: "$employeeUniqueNumber" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$employeUniqueId", "$$uniqueId"] },
                },
              },
            ],
            as: "employeeDetails",
          },
        },
        { $unwind: "$employeeDetails" },
        {
          $lookup: {
            from: "newbranches",
            localField: "employeeDetails.branchId",
            foreignField: "_id",
            as: "branchDetails",
          },
        },
        { $unwind: "$branchDetails" },
        {
          $project: {
            text: {
              $toUpper: {
                $concat: [
                  "Visit Done By:- ",
                  "$employeeDetails.employeName",
                  " (BRANCH:- ",
                  "$branchDetails.name",
                  ")",
                ],
              },
            },
            createdAt: 1,
            type: { $literal: "visit" },
          },
        },
      ]);
  
      const emiReceivedEmployees = await collectionModel.aggregate([
        {
          $match: {
            status: "accept",
            createdAt: { $gte: start, $lt: end },
          },
        },
        {
          $addFields: {
            employeeUniqueNumber: {
              $arrayElemAt: [{ $split: ["$collectedBy", "-"] }, 1],
            },
          },
        },
        {
          $lookup: {
            from: "employees",
            let: { uniqueId: "$employeeUniqueNumber" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$employeUniqueId", "$$uniqueId"] },
                },
              },
            ],
            as: "employeeDetails",
          },
        },
        { $unwind: "$employeeDetails" },
        {
          $lookup: {
            from: "newbranches",
            localField: "employeeDetails.branchId",
            foreignField: "_id",
            as: "branchDetails",
          },
        },
        { $unwind: "$branchDetails" },
        {
          $project: {
            text: {
              $toUpper: {
                $concat: [
                  "Emi Received By:-",
                  "$employeeDetails.employeName",
                  " (BRANCH:- ",
                  "$branchDetails.name",
                  ")",
                ],
              },
            },
            createdAt: 1,
            type: { $literal: "emi" },
          },
        },
      ]);
  
      const combinedScrollingText = [
        ...visitDoneEmployees,
        ...emiReceivedEmployees,
      ];
  
      return success(res, "Get All Scrolling Text Notification", combinedScrollingText);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  

  module.exports = {
    scrollingTextAdd,
    scrollingTextDelete,
    updateScrollingText,
    getAllScrollingText,
    getAllScrollingNotification
  };
  



   // Fetch employees for loginDone condition (salesCompleteDate matches current date)
  //  const loginDoneEmployees = await processModel.aggregate([
  //   {
  //     $match: {
  //       customerFormComplete: true,
  //       applicantFormComplete: true,
  //       coApplicantFormComplete: true,
  //       employeId: { $ne: "" }, // Ensure employeeId is not empty

  //        $expr: {
  //         $eq: [
  //           { $substr: ["$salesCompleteDate", 0, 10] }, // Extract first 10 characters (YYYY-MM-DD)
  //           todayDateString
  //         ]
  //       }
  //  // Match only today's date
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "employees",
  //       localField: "employeId",
  //       foreignField: "_id",
  //       as: "employeeDetails",
  //     },
  //   },
  //   { $unwind: "$employeeDetails" },
  //   {
  //     $lookup: {
  //       from: "newbranches",
  //       localField: "employeeDetails.branchId",
  //       foreignField: "_id",
  //       as: "branchDetails",
  //     },
  //   },
  //   { $unwind: "$branchDetails" },
  //   {
  //     $project: {
  //       text: {
  //         $toUpper: {
  //         $concat: [
  //           "Login Done By:- ",
  //           "$employeeDetails.employeName",
  //           " (BRANCH:- ",
  //           "$branchDetails.name",
  //           ")"
  //         ],
  //       },
  //       },
  //       type: { $literal: "login" },  
  //     },
  //   },
  // ]);

       // Fetch employees for pdDone condition (creditPdCompleteDate matches current date)
      //  const pdDoneEmployees = await externalVendorDynamicModel.aggregate([
      //   {
      //     $match: {
      //       statusByCreditPd: "approve",
      //       $expr: {
      //         $eq: [
      //           { $substr: ["$creditPdCompleteDate", 0, 10] },
      //           todayDateString
      //         ]
      //       }
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "employees",
      //       localField: "creditPdId",
      //       foreignField: "_id",
      //       as: "employeeDetails",
      //     },
      //   },
      //   { $unwind: "$employeeDetails" },
      //   {
      //     $lookup: {
      //       from: "newbranches",
      //       localField: "employeeDetails.branchId",
      //       foreignField: "_id",
      //       as: "branchDetails",
      //     },
      //   },
      //   { $unwind: "$branchDetails" },
      //   {
      //     $project: {
      //       text: {
      //         $toUpper: {
      //         $concat: [
      //           "Pd Done By:- ",
      //           "$employeeDetails.employeName",
      //           " (BRANCH:- ",
      //           "$branchDetails.name",
      //           ")"
      //         ],
      //       },
      //       },
      //       type: { $literal: "pd" },
      //     },
      //   },
      // ]);


      // // Combine all scrolling text messages
      // let combinedScrollingText = [
      //   ...scrollingText.map((item) => ({ _id: item._id, text: item.title.toUpperCase() ,type: 'notification'})),
      //   ...loginDoneEmployees,
      //   ...visitDoneEmployees,
      //   ...emiReceivedEmployees,
      //   ...pdDoneEmployees,
      // ];