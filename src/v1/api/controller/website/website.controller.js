const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const contactUsModel = require("../../model/website/contactUs.model");
const businessContactModel = require("../../model/website/businessContact.model");
const patnersDetailModel = require("../../model/website/patnersDetail.model");
const patnershipRequestModel = require("../../model/website/patnershipRequest.model");
const branchMapModel = require("../../model/website/branchMap.model");
const employeModel = require("../../model/adminMaster/employe.model");
const Dsa = require("../../model/website/Dsa.model");



//-------------- DSA CONTROLLER (CRUD) ------------------------------//


async function addDsa(req, res) {

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const dsa = await Dsa.create(req.body);

    success(res, "DSA Added Successfully", dsa);
  } catch (error) {
    unknownError(res, error);
  }
}

//  GetAll DSA //


async function getAllDsa(req, res) {
  try {

    const dsa = await Dsa.find({}).sort({ createdAt: -1 });

    if (!dsa) {
    return success(res, "No DSA Found", dsa);
    }
    return success(res, "DSA Data", dsa);
    
  } catch (error) {
    unknownError(res, error);
    
  }
}


// ---- Get DSA by ID ----//

async function getDsaById(req, res) {

  try {
    const dsaId = req.params.id;
    if (!dsaId) {
      return badRequest(res, "DSA ID is required");
    }
   const dsa = await Dsa.findById(dsaId);
    if (!dsa) {
      return success(res, "No DSA Found", dsa);
    }
    return success(res, "DSA Data", dsa);

}
catch (error) {
  unknownError(res, error);
}
}



/// ------------  Update DSA -----------------//

async function updateDsa(req, res) {
  try {
    const dsaId = req.params.id;
    if (!dsaId) {
      return badRequest(res, "DSA ID is required");
    }
    const dsa = await Dsa.findByIdAndUpdate(dsaId, req.body, { new: true });
    if (!dsa) {
      return success(res, "No DSA Found", dsa);
    }

    return success(res, "DSA Updated Successfully", dsa);

  } catch (error) {
    unknownError(res, error);
  }
}


// -------------- Delete DSA -----------------//

async function deleteDsa(req, res) {
  try {
    const dsaId = req.params.id;
    if (!dsaId) {
      return badRequest(res, "DSA ID is required");
    }
    const dsa = await Dsa.findByIdAndDelete(dsaId);
    if (!dsa) {
      return success(res, "No DSA Found", dsa);
    }
    return success(res, "DSA Deleted Successfully", dsa);
  } catch (error) {
    unknownError(res, error);
  }
}
















// ------------------website  Add contact us ---------------------------------------
async function addContactUS(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Helper function to capitalize the first letter of each field
    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    let fieldsToProcess = ["name", "hearAboutUs", "message"];
    fieldsToProcess.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = capitalizeFirstLetter(req.body[field].trim());
      }
    });

    // Update the contact if it exists or create a new one if it doesn't
    const contactUs = await contactUsModel.create(req.body);

    success(res, "ContactUs Added Successfully", contactUs);
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------ website  get contact us  ---------------------------------------

async function getContactUS(req, res) {
  try {
    let contactUs = await contactUsModel.find({
      status: "active",
    });
    success(res, " Contact Us Data", contactUs);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ website  add Business Contact  ---------------------------------------

async function addbusinessContact(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const contactId = req.body.id;
    let businessContact;
    if (contactId) {
      businessContact = await businessContactModel.findByIdAndUpdate(
        contactId,
        req.body,
        { new: true } // Return the updated document
      );

      if (!businessContact) {
        return res.status(404).json({
          errorName: "notFound",
          message: "No business contact found with the given ID",
        });
      }

      success(res, "Business Contact Updated Successfully", businessContact);
    } else {
      // Add a new business contact if no ID is provided
      businessContact = await businessContactModel.create(req.body);
      success(res, "Business Contact Added Successfully", businessContact);
    }
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ website  get contact us  ---------------------------------------

async function getbusinessContact(req, res) {
  try {
    let businessContact = await businessContactModel.find({
      status: "active",
    });
    success(res, " Business Contact Data", businessContact);
  } catch (error) {
    unknownError(res, error);
  }
}
module.exports = {
  addContactUS,
  getContactUS,
  addbusinessContact,
  getbusinessContact,
};
// ------------------ website  delete contact us  ---------------------------------------

async function deletebusinessContact(req, res) {
  try {
    const contactId = req.body.id;

    if (!contactId) {
      return res.status(400).json({
        errorName: "badRequest",
        message: "Contact ID is required",
      });
    }

    // Update the status to "inactive" to soft-delete the business contact
    let businessContact = await businessContactModel.findOneAndUpdate(
      { _id: contactId, status: "active" },
      { status: "inactive" },
      { new: true } // Return the updated document
    );

    if (!businessContact) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No active business contact found with the given ID",
      });
    }

    success(
      res,
      "Business Contact marked as inactive successfully",
      businessContact
    );
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ website  add patners details  ---------------------------------------

async function addPatnersDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const patnersDetailId = req.body.id;
    let patnersDetail;
    if (patnersDetailId) {
      patnersDetail = await patnersDetailModel.findByIdAndUpdate(
        patnersDetailId,
        req.body,
        { new: true } // Return the updated document
      );

      if (!patnersDetail) {
        return res.status(404).json({
          errorName: "notFound",
          message: "No Patners Details found with the given ID",
        });
      }

      success(res, "Patners Details Updated Successfully", patnersDetail);
    } else {
      // Add a new business contact if no ID is provided
      patnersDetail = await patnersDetailModel.create(req.body);
      success(res, "Patners Details Added Successfully", patnersDetail);
    }
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ website  get patners details  ---------------------------------------

async function getPatnersDetail(req, res) {
  try {
    let patnersDetail = await patnersDetailModel.find({
      status: "active",
    });
    success(res, " Patners Detail data", patnersDetail);
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------ website  delete contact us  ---------------------------------------

async function deletePatnersDetail(req, res) {
  try {
    const patnersDetailId = req.body.id;

    if (!patnersDetailId) {
      return res.status(400).json({
        errorName: "badRequest",
        message: "Patners Detail Id is required",
      });
    }
    // Update the status to "inactive" to soft-delete the patners Detail
    let patnersDetail = await patnersDetailModel.findOneAndUpdate(
      { _id: patnersDetailId, status: "active" },
      { status: "inactive" },
      { new: true } // Return the updated document
    );

    if (!patnersDetail) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No active Patners Detail found with the given ID",
      });
    }

    success(
      res,
      "Patners Detail marked as inactive successfully",
      patnersDetail
    );
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ website  add PatnershipRequest details  ---------------------------------------

async function addPatnershipRequest(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    // Helper function to capitalize the first letter of each field
    const capitalizeFirstLetter = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    let fieldsToProcess = ["companyName", "auhtorizedPersonName", "reason"];
    fieldsToProcess.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = capitalizeFirstLetter(req.body[field].trim());
      }
    });
    const patnershipRequest = await patnershipRequestModel.create(req.body);
    success(res, "Patnership Request Added Successfully", patnershipRequest);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------ website  get patners details  ---------------------------------------

async function getPatnershipRequest(req, res) {
  try {
    let patnershipRequest = await patnershipRequestModel.find({
      status: "active",
    });
    success(res, "  Patnership Request Data", patnershipRequest);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ website  add branch details  ---------------------------------------

async function addBranchMapDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const branchMapDetailId = req.body.id;
    let branchMapDetail;
    if (branchMapDetailId) {
      branchMapDetail = await branchMapModel.findByIdAndUpdate(
        branchMapDetailId,
        req.body,
        { new: true } // Return the updated document
      );

      if (!branchMapDetail) {
        return res.status(404).json({
          errorName: "notFound",
          message: "No BranchMap found with the given ID",
        });
      }

      success(res, "BranchMap Updated Successfully", branchMapDetail);
    } else {
      // Add a new business contact if no ID is provided
      branchMapDetail = await branchMapModel.create(req.body);
      success(res, "BranchMap Added Successfully", branchMapDetail);
    }
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ website  get branch map details  ---------------------------------------

async function getBranchMapDetail(req, res) {
  try {
    let branchMap = await branchMapModel.find({
      status: "active",
    });
    success(res, " Branch Map Data", branchMap);
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------ website  delete branch  map  ---------------------------------------

async function deleteBranchMap(req, res) {
  try {
    const branchMapId = req.body.id;

    if (!branchMapId) {
      return res.status(400).json({
        errorName: "badRequest",
        message: "BranchMap Id is required",
      });
    }
    // Update the status to "inactive" to soft-delete the BranchMap Detail
    let branchMap = await branchMapModel.findOneAndUpdate(
      { _id: branchMapId, status: "active" },
      { status: "inactive" },
      { new: true } // Return the updated document
    );

    if (!branchMap) {
      return res.status(404).json({
        errorName: "notFound",
        message: "No active BranchMap Detail found with the given ID",
      });
    }

    success(res, "BranchMap marked as inactive successfully", branchMap);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------ website  employee active inactive  ---------------------------------------
async function websiteActiveInactiveEmployee(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.id;
      const status = req.body.status;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      if (status == "active") {
        const employeUpdateStatus = await employeModel.findByIdAndUpdate(
          { _id: id },
          { websiteListing: "active" },
          { new: true }
        );
        success(
          res,
          "employee website Listing status Active",
          employeUpdateStatus
        );
      } else if (status == "inactive") {
        const employeUpdateStatus = await employeModel.findByIdAndUpdate(
          { _id: id },
          { websiteListing: "inactive" },
          { new: true }
        );
        success(
          res,
          "employee website Listing status inactive",
          employeUpdateStatus
        );
      } else {
        return badRequest(
          res,
          "website Listing status must be 'active' or 'inactive'"
        );
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = {
  addContactUS,
  getContactUS,
  addbusinessContact,
  getbusinessContact,
  deletebusinessContact,
  addPatnersDetail,
  getPatnersDetail,
  deletePatnersDetail,
  addPatnershipRequest,
  getPatnershipRequest,
  addBranchMapDetail,
  getBranchMapDetail,
  deleteBranchMap,
  websiteActiveInactiveEmployee,
  addDsa,
getAllDsa,
getDsaById,
updateDsa,
deleteDsa

};
