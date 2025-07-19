const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const pdfTemplateModel = require("../../model/adminMaster/pdfTemplate.model");
const { default: BaseParser } = require("pdf-lib/cjs/core/parser/BaseParser");

// ------------------Admin Master Add pdfTemplate---------------------------------------
async function pdfTemplateAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    let fieldsToProcess = ['title', 'workFlow'];
    fieldsToProcess.forEach(field => {
      if (req.body[field]) {
        req.body[field] = req.body[field].toLowerCase().trim();
      }
    });
    const pdfTemplate = await pdfTemplateModel.findOne({ type: req.body.type })
    if (pdfTemplate) {
      return badRequest(res, "pdf Template Type Already Register")
    }
    const pdfTemplateDetail = await pdfTemplateModel.create(req.body);

    success(res, "pdfTemplate Added Successful", pdfTemplateDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

// ------------------Admin Master Update  pdfTemplate Title ---------------------------------------
async function updatepdfTemplate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let { pdfTemplateId, ...updateFields } = req.body;
    const foundData = await pdfTemplateModel.findByIdAndUpdate(pdfTemplateId)
    if (!foundData) {
      return notFound(res, "not found")
    }
    if (typeof updateFields.workFlow === 'string') {
      updateFields.workFlow = updateFields.workFlow.toLowerCase().trim();
    }
    if (typeof updateFields.title === 'string') {
      updateFields.title = updateFields.title.toLowerCase().trim();
    }
    const updateData = await pdfTemplateModel.findByIdAndUpdate(pdfTemplateId, updateFields, { new: true });
    return success(res, "Updated pdfTemplate", updateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

// ------------------Admin Master Get All pdfTemplate---------------------------------------
async function getAllpdfTemplate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const templateType = req.query.templateType
    let pdfTemplateDetail;
    if (templateType === "all") {
      pdfTemplateDetail = await pdfTemplateModel.find({ status: "active"});
    } else if(templateType === "cam" ||templateType === "e-sign"){
      pdfTemplateDetail = await pdfTemplateModel.find({ status: "active", type: templateType });
    } else{
      return badRequest(res, "templateType to be `all` `cam` and `e-sign")
    }

    // pdfTemplateDetail = pdfTemplateDetail.map((pdfTemplate) => {
    //   return {
    //     ...pdfTemplate.toObject(),
    //     type: pdfTemplate.type.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    //     title: pdfTemplate.title.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    //     workFlow: pdfTemplate.workFlow.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    //   }
    // })
    success(res, `${templateType} pdf Template`, pdfTemplateDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
};

// ------------------Admin Master pdfTemplate "active" or "inactive" updated---------------------------------------
async function pdfTemplateActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, { errorName: "serverValidation", errors: errors.array() });
    } else {
      const status = req.body.status
      const { id } = req.body;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      if (status == "active") {
        const pdfTemplateStatusUpdate = await pdfTemplateModel.findByIdAndUpdate({ _id: id }, { status: "active" }, { new: true })
        success(res, "pdfTemplate Active", pdfTemplateStatusUpdate);
      }
      else if (status == "inactive") {
        const pdfTemplateStatusUpdate = await pdfTemplateModel.findByIdAndUpdate({ _id: id }, { status: "inactive" }, { new: true })
        success(res, "pdfTemplate inactive", pdfTemplateStatusUpdate);
      }
      else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//------------------Admin Master pdfTemplate Details---------------------------------------
async function detailpdfTemplate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { id } = req.params;
    if (!id) {
      return badRequest(res, "ID is required");
    }
    if (!mongoose.isValidObjectId(id)) {
      return badRequest(res, "Invalid ID");
    }
    const pdfTemplateData = await pdfTemplateModel.findById(id);
    if (!pdfTemplateData) {
      return notFound(res, "pdfTemplate not found");
    }
    success(res, "pdfTemplate detail successfully", pdfTemplateData);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = { pdfTemplateAdd, updatepdfTemplate, pdfTemplateActiveOrInactive, getAllpdfTemplate, detailpdfTemplate }
