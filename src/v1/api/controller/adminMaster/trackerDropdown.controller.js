const {
    success,
    unknownError,
    serverValidation,
    notFound,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const titleDropdownModel = require("../../model/adminMaster/titleDropdown.model");
  const trackerDropdownModel = require("../../model/adminMaster/trackerDropdown.model");
  
  // ------------------Admin Master Add Tracker Dropdown Title---------------------------------------
  async function  addTrackerDropdown(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const {formTitleId , title} = req.body
      if (!formTitleId || formTitleId.trim() === "") {
        return badRequest(res , "formTitleId is required and cannot be empty");
    }
      if(!title){
        return badRequest(res , "title Required")
      }
      const titleForm = await titleDropdownModel.findById({_id:new ObjectId(req.body.formTitleId)})
      if(!titleForm){
        return notFound(res , "Not Found formTitleId")
      }
      const targetExist = await trackerDropdownModel.findOne({title:title})
      if(targetExist){
        return badRequest(res , "Tracker dropdown title already exist")
      }
      const TrackerDropdownDetail = await trackerDropdownModel.create(req.body);
      success(res, "Tracker Dropdown Added Successful", TrackerDropdownDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Tracker Dropdown "active" or "inactive" updated------------------
  async function activeOrInactiveTrackerDropdown(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
        } else {
          const  trackerId = req.body.trackerId;
          const status = req.body.status
          if (!trackerId || trackerId.trim() === "") {
            return badRequest(res , "trackerId is required and cannot be empty");
        }
        const trackerForm = await trackerDropdownModel.findById({_id:new ObjectId(req.body.trackerId)})
        if(!trackerForm){
          return notFound(res , "Not Found trackerId")
        }
  
            if (status == "active") {
                const targetFormStatus =  await trackerDropdownModel.findByIdAndUpdate({ _id:new ObjectId(trackerId)}, { status: "active"},{new:true})
            success(res, "Tracker Dropdown Active" ,targetFormStatus);
            }
           else if (status == "inactive") {
            const targetFormStatus =  await trackerDropdownModel.findByIdAndUpdate({ _id:new ObjectId(trackerId)}, { status:"inactive"},{new:true})
            success(res, "Tracker Dropdown inactive" ,targetFormStatus);
            }
            else{
                return badRequest(res , "Status must be 'active' or 'inactive'");
            }
           
        }
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
  }
  
  // ------------------Admin Master Update Tracker Dropdown Title -----------------------------------
  async function updateTrackerDropdown(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      let { trackerId , title } = req.body;
      if (!trackerId || trackerId.trim() === "") {
        return badRequest(res, "trackerId is required and cannot be empty");
      }

      const trackerForm = await trackerDropdownModel.findById({_id:new ObjectId(req.body.trackerId)})
      if(!trackerForm){
        return notFound(res , "Not Found trackerId")
      }

      const updateData = await trackerDropdownModel.findByIdAndUpdate(trackerId, req.body, {new :true});
      success(res, "Updated Tracker Dropdown",updateData);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Admin Master Get All Tracker Dropdown List formTitleId------------------------------------
  async function getAllTrackerDropdown(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorName: "serverValidation",
                errors: errors.array(),
            });
        }
        const formTitleId = req.query.formTitleId;
        const modeDetail = await trackerDropdownModel.aggregate([
            { $match: { formTitleId:new ObjectId(formTitleId), status: "active" } },
            {
                $lookup: {
                    from: "titlemasters",
                    localField: "formTitleId",
                    foreignField: "_id",
                    as: "titleMasterDropdown"
                }
            },
            {
                $project: {
                    "titleMasterDropdown.__v": 0,
                    "titleMasterDropdown.createdAt": 0,
                    "titleMasterDropdown.updatedAt": 0
                }
            }
        ]).sort({ createdAt: -1 });

        const detail = modeDetail.map(item => {
            if (!item.titleMasterDropdown || item.titleMasterDropdown.length === 0) {
                item.titleMasterDropdown = {};  
            } else {
                item.titleMasterDropdown = item.titleMasterDropdown[0]; 
            }
            return item;
        });

        success(res, "All Tracker Dropdown List", detail);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};
  

  
  module.exports = {
    addTrackerDropdown ,
    getAllTrackerDropdown,
    updateTrackerDropdown , 
    activeOrInactiveTrackerDropdown 
};
  
