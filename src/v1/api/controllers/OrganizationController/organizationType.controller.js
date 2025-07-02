import organizationType from "../../models/masterDropDownModel/organizationType.model.js"
import industryTypeModel from "../../models/masterDropDownModel/IndustryType.model.js"
import sectorTypeModel from "../../models/masterDropDownModel/sectoreType.model.js"
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import { success, badRequest, unknownError, notFound } from "../../formatters/globalResponse.js"
import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import roleModel from "../../models/RoleModel/role.model.js";
import employeeModel from "../../models/employeemodel/employee.model.js";
import currencyModel from "../../models/currencyModel/currency.model.js"

// // Organization Type //
// // Create Type
// export const createOrgType = async (req, res) => {
//   try {
//     const { name } = req.body;
//     const exists = await OrganizationType.findOne({ name });
//     if (exists) return badRequest(res, "Type already exists");

//     const saved = await new OrganizationType({ name }).save();
//     return success(res, "Organization type created", saved);
//   } catch (error) {
//     return unknownError(res, error);
//   }
// };

// // Get All Types
// export const getOrgTypes = async (req, res) => {
//   try {
//     const types = await OrganizationType.find({ status: "active" }).sort({ createdAt: -1 });
//     return success(res, "Organization types fetched", types);
//   } catch (error) {
//     return unknownError(res, error);
//   }
// };

// // Update Type
// export const updateOrgType = async (req, res) => {
//   try {
//     const updated = await OrganizationType.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updated) return notFound(res, "Type not found");
//     return success(res, "Type updated", updated);
//   } catch (error) {
//     return unknownError(res, error);
//   }
// };

// // Delete Type
// export const deleteOrgType = async (req, res) => {
//   try {
//     const deleted = await OrganizationType.findByIdAndDelete(req.params.id);
//     if (!deleted) return notFound(res, "Type not found");
//     return success(res, "Type deleted", deleted);
//   } catch (error) {
//     return unknownError(res, error);
//   }
// };

// ------- END ----------- //


// Create A Organization setUp // 

// CREATE
// export const createOrganization = async (req, res) => {
//   try {
//     const org = new OrganizationModel(req.body);
//     const saved = await org.save();
//     return success(res, "Organization created", saved);
//   } catch (error) {
//     return unknownError(res, error);
//   }
// };




export const createOrganization = async (req, res) => {
  try {
    const {
      typeOfOrganization,
      typeOfIndustry,
      typeOfSector,
    } = req.body;


    if (!typeOfOrganization) return badRequest(res, "Organization type are required.");
    if (!typeOfIndustry) return badRequest(res, "Industry type are required.");
    if (!typeOfSector) return badRequest(res, "Sector type are required.");

    // 3. Save the organization
    const org = new OrganizationModel({
      ...req.body,
      userId: req.employee?.id || null, // if user ID needs to be saved
    });
    const saved = await org.save();


    // const roleData = await roleModel.findOne({ roleName: "SuperAdmin" });
    // const { employeName, userName, password } = req.body.employeeData || {};

    // if (!userName) return badRequest(res, "userName  are required.");
    // if (!employeName) return badRequest(res, "employeName  are required.");
    // if (!password) return badRequest(res, "password  are required.");

    // const userExist = await employeeModel.findOne({userName:userName})

    // if(userExist){
    //   return badRequest(res, "userNmae Already Exist.");
    // }

    //  const salt = await bcrypt.genSalt(10);
    //       const hashPassword = await bcrypt.hash(password, salt);
    // const employeeData = await employeeModel.create({
    //   // employeName,
    //   userName,
    //   password:hashPassword,
    //   roleId: roleData._id,
    //   organizationId: saved._id,
    //   location: {
    //     type: "Point",
    //     coordinates: [0, 0],
    //   },
    // });

    return success(res, "Organization created", saved);
  } catch (error) {
    return unknownError(res, error);
  }
};


export const getAllOrganizations = async (req, res) => {

  try {

    // const OrganizationId=req.employee?.organizationId;
    // if (!OrganizationId) return badRequest(res, "Organization ID is required.");

    const orgs = await OrganizationModel.aggregate([

      // {
      //   $match: {
      //     _id: new mongoose.Types.ObjectId(OrganizationId)
      //   }
      // },
      // Lookup employee details by organizationId
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "organizationId",
          as: "employees"
        }
      },
      {
        $addFields: {
          employeeDetail: {
            $cond: [
              { $gt: [{ $size: "$employees" }, 0] },
              {
                $reduce: {
                  input: "$employees",
                  initialValue: "",
                  in: {
                    $cond: [
                      { $eq: ["$$value", ""] },
                      "$$this.userName",
                      { $concat: ["$$value", ", ", "$$this.userName"] }
                    ]
                  }
                }
              },
              null
            ]
          }
        }
      },

      // Lookup and unwind typeOfOrganization
      {
        $lookup: {
          from: "subdropdowns",
          localField: "typeOfOrganization",
          foreignField: "_id",
          as: "typeOfOrganizationDetail"
        }
      },
      {
        $unwind: {
          path: "$typeOfOrganizationDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $lookup: {
          from: "plans",
          localField: "PlanId",
          foreignField: "_id",
          as: "PlanDetail"
        }
      }, {
        $unwind: {
          path: "$PlanDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // {
      //   $lookup: {
      //     from: "subdropdowns",
      //     localField: "defaultCurrenyId",
      //     foreignField: "_id",
      //     as: "defaultCurrenyDetail"
      //   }
      // },
      // {
      //   $unwind: {
      //     path: "$defaultCurrenyDetail",
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // Lookup and unwind typeOfIndustry
      {
        $lookup: {
          from: "subdropdowns",
          localField: "typeOfIndustry",
          foreignField: "_id",
          as: "typeOfIndustryDetail"
        }
      },
      {
        $unwind: {
          path: "$typeOfIndustryDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "currencies",
          localField: "defaultCurreny",
          foreignField: "_id",
          as: "currenyDetail"
        }
      },
      {
        $unwind: {
          path: "$currenyDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup promoter language preference
      {
        $lookup: {
          from: "subdropdowns",
          localField: "promoterDetail.languagePreferenceId",
          foreignField: "_id",
          as: "promoterLanguageDetail"
        }
      },
      {
        $unwind: {
          path: "$promoterLanguageDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup promoter qualification
      {
        $lookup: {
          from: "subdropdowns",
          localField: "promoterDetail.qualificationId",
          foreignField: "_id",
          as: "promoterQualificationDetail"
        }
      },
      {
        $unwind: {
          path: "$promoterQualificationDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup management language preference
      {
        $lookup: {
          from: "subdropdowns",
          localField: "managementDetail.languagePreferenceId",
          foreignField: "_id",
          as: "managementLanguageDetail"
        }
      },
      {
        $unwind: {
          path: "$managementLanguageDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup management qualification
      {
        $lookup: {
          from: "subdropdowns",
          localField: "managementDetail.qualificationId",
          foreignField: "_id",
          as: "managementQualificationDetail"
        }
      },
      {
        $unwind: {
          path: "$managementQualificationDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup and unwind typeOfSector
      {
        $lookup: {
          from: "subdropdowns",
          localField: "typeOfSector",
          foreignField: "_id",
          as: "typeOfSectorDetail"
        }
      },
      {
        $unwind: {
          path: "$typeOfSectorDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup userId (creator)
      {
        $lookup: {
          from: "employees",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'allocateds',
          localField: 'allocatedModule',
          foreignField: '_id',
          as: 'allocatedModule'
        }
      },

      // Format all fields and maintain nested structure
      {
        $addFields: {
          // Format typeOfOrganization
          typeOfOrganization: {
            $cond: [
              { $ne: ["$typeOfOrganizationDetail", null] },
              {
                _id: "$typeOfOrganizationDetail._id",
                name: "$typeOfOrganizationDetail.name"
              },
              { _id: null, name: "" }
            ]
          },

          // defaultCurrenyId: {
          //   $cond: [
          //     { $ne: ["$defaultCurrenyDetail", null] },
          //     {
          //       _id: "$defaultCurrenyDetail._id",
          //       name: "$defaultCurrenyDetail.name"
          //     },
          //     { _id: null, name: "" }
          //   ]
          // },
          // Format typeOfIndustry
          typeOfIndustry: {
            $cond: [
              { $ne: ["$typeOfIndustryDetail", null] },
              {
                _id: "$typeOfIndustryDetail._id",
                name: "$typeOfIndustryDetail.name"
              },
              { _id: null, name: "" }
            ]
          },

          defaultCurreny: {
            $cond: [
              { $ne: ["$currenyDetail", null] },
              {
                _id: "$currenyDetail._id",
                name: "$currenyDetail.name",
                icon: "$currenyDetail.icon"
              },
              { _id: null, name: "" }
            ]
          },

          // Format typeOfSector
          typeOfSector: {
            $cond: [
              { $ne: ["$typeOfSectorDetail", null] },
              {
                _id: "$typeOfSectorDetail._id",
                name: "$typeOfSectorDetail.name"
              },
              { _id: null, name: "" }
            ]
          },

          // Format promoterDetail with nested lookup fields
          promoterDetail: {
            $cond: [
              { $ne: ["$promoterDetail", null] },
              {
                $mergeObjects: [
                  "$promoterDetail",
                  {
                    languagePreferenceId: {
                      $cond: [
                        { $ne: ["$promoterLanguageDetail", null] },
                        {
                          _id: "$promoterLanguageDetail._id",
                          name: "$promoterLanguageDetail.name"
                        },
                        { _id: null, name: "" }
                      ]
                    },
                    qualificationId: {
                      $cond: [
                        { $ne: ["$promoterQualificationDetail", null] },
                        {
                          _id: "$promoterQualificationDetail._id",
                          name: "$promoterQualificationDetail.name"
                        },
                        { _id: null, name: "" }
                      ]
                    }
                  }
                ]
              },
              null
            ]
          },

          // Format managementDetail with nested lookup fields
          managementDetail: {
            $cond: [
              { $ne: ["$managementDetail", null] },
              {
                $mergeObjects: [
                  "$managementDetail",
                  {
                    languagePreferenceId: {
                      $cond: [
                        { $ne: ["$managementLanguageDetail", null] },
                        {
                          _id: "$managementLanguageDetail._id",
                          name: "$managementLanguageDetail.name"
                        },
                        { _id: null, name: "" }
                      ]
                    },
                    qualificationId: {
                      $cond: [
                        { $ne: ["$managementQualificationDetail", null] },
                        {
                          _id: "$managementQualificationDetail._id",
                          name: "$managementQualificationDetail.name"
                        },
                        { _id: null, name: "" }
                      ]
                    }
                  }
                ]
              },
              null
            ]
          },

          // Format userId
          userId: {
            name: { $ifNull: ["$userInfo.employeName", ""] },
            email: { $ifNull: ["$userInfo.email", ""] },
            userName: { $ifNull: ["$userInfo.userName", ""] },
            _id: { $ifNull: ["$userInfo._id", null] }
          },
          allocatedModule: {
            $map: {
              input: "$allocatedModule",
              as: "item",
              in: {
                _id: "$$item._id",
                Name: "$$item.Name",
                Cost: "$$item.Cost",
                status: "$$item.status"
              }
            }
          }
        }
      },

      // Remove unwanted fields
      {
        $project: {
          plandetail: 0,
          employees: 0,
          userInfo: 0,
          typeOfOrganizationDetail: 0,
          // defaultCurrenyDetail:0,
          typeOfIndustryDetail: 0,
          currenyDetail: 0,
          typeOfSectorDetail: 0,
          promoterLanguageDetail: 0,
          promoterQualificationDetail: 0,
          managementLanguageDetail: 0,
          managementQualificationDetail: 0
        }
      }
    ]);

    return success(res, "Organizations fetched", orgs);
  } catch (error) {
    return unknownError(res, error);
  }
};


// Fetch particular organization by ID
export const getOrganizations = async (req, res) => {

  try {

    const OrganizationId = req.employee?.organizationId;
    if (!OrganizationId) return badRequest(res, "Organization ID is required.");

    const orgs = await OrganizationModel.aggregate([

      {
        $match: {
          _id: new mongoose.Types.ObjectId(OrganizationId)
        }
      },
      // Lookup employee details by organizationId
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "organizationId",
          as: "employees"
        }
      },
      {
        $addFields: {
          employeeDetail: {
            $cond: [
              { $gt: [{ $size: "$employees" }, 0] },
              {
                $reduce: {
                  input: "$employees",
                  initialValue: "",
                  in: {
                    $cond: [
                      { $eq: ["$$value", ""] },
                      "$$this.userName",
                      { $concat: ["$$value", ", ", "$$this.userName"] }
                    ]
                  }
                }
              },
              null
            ]
          }
        }
      },

      // Lookup and unwind typeOfOrganization
      {
        $lookup: {
          from: "subdropdowns",
          localField: "typeOfOrganization",
          foreignField: "_id",
          as: "typeOfOrganizationDetail"
        }
      },
      {
        $unwind: {
          path: "$typeOfOrganizationDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $lookup: {
          from: "plans",
          localField: "PlanId",
          foreignField: "_id",
          as: "PlanDetail"
        }
      }, {
        $unwind: {
          path: "$PlanDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // {
      //   $lookup: {
      //     from: "subdropdowns",
      //     localField: "defaultCurrenyId",
      //     foreignField: "_id",
      //     as: "defaultCurrenyDetail"
      //   }
      // },
      // {
      //   $unwind: {
      //     path: "$defaultCurrenyDetail",
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // Lookup and unwind typeOfIndustry
      {
        $lookup: {
          from: "subdropdowns",
          localField: "typeOfIndustry",
          foreignField: "_id",
          as: "typeOfIndustryDetail"
        }
      },
      {
        $unwind: {
          path: "$typeOfIndustryDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "currencies",
          localField: "defaultCurreny",
          foreignField: "_id",
          as: "currenyDetail"
        }
      },
      {
        $unwind: {
          path: "$currenyDetail",
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup promoter language preference
      {
        $lookup: {
          from: "subdropdowns",
          localField: "promoterDetail.languagePreferenceId",
          foreignField: "_id",
          as: "promoterLanguageDetail"
        }
      },
      {
        $unwind: {
          path: "$promoterLanguageDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup promoter qualification
      {
        $lookup: {
          from: "subdropdowns",
          localField: "promoterDetail.qualificationId",
          foreignField: "_id",
          as: "promoterQualificationDetail"
        }
      },
      {
        $unwind: {
          path: "$promoterQualificationDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup management language preference
      {
        $lookup: {
          from: "subdropdowns",
          localField: "managementDetail.languagePreferenceId",
          foreignField: "_id",
          as: "managementLanguageDetail"
        }
      },
      {
        $unwind: {
          path: "$managementLanguageDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup management qualification
      {
        $lookup: {
          from: "subdropdowns",
          localField: "managementDetail.qualificationId",
          foreignField: "_id",
          as: "managementQualificationDetail"
        }
      },
      {
        $unwind: {
          path: "$managementQualificationDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup and unwind typeOfSector
      {
        $lookup: {
          from: "subdropdowns",
          localField: "typeOfSector",
          foreignField: "_id",
          as: "typeOfSectorDetail"
        }
      },
      {
        $unwind: {
          path: "$typeOfSectorDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      // Lookup userId (creator)
      {
        $lookup: {
          from: "employees",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true
        }
      }, {
        $lookup: {
          from: 'allocateds',
          localField: 'allocatedModule',
          foreignField: '_id',
          as: 'allocatedModule'
        }
      },

      // Format all fields and maintain nested structure
      {
        $addFields: {
          // Format typeOfOrganization
          typeOfOrganization: {
            $cond: [
              { $ne: ["$typeOfOrganizationDetail", null] },
              {
                _id: "$typeOfOrganizationDetail._id",
                name: "$typeOfOrganizationDetail.name"
              },
              { _id: null, name: "" }
            ]
          },

          // defaultCurrenyId: {
          //   $cond: [
          //     { $ne: ["$defaultCurrenyDetail", null] },
          //     {
          //       _id: "$defaultCurrenyDetail._id",
          //       name: "$defaultCurrenyDetail.name"
          //     },
          //     { _id: null, name: "" }
          //   ]
          // },
          // Format typeOfIndustry
          typeOfIndustry: {
            $cond: [
              { $ne: ["$typeOfIndustryDetail", null] },
              {
                _id: "$typeOfIndustryDetail._id",
                name: "$typeOfIndustryDetail.name"
              },
              { _id: null, name: "" }
            ]
          },

          defaultCurreny: {
            $cond: [
              { $ne: ["$currenyDetail", null] },
              {
                _id: "$currenyDetail._id",
                name: "$currenyDetail.name",
                icon: "$currenyDetail.icon"
              },
              { _id: null, name: "" }
            ]
          },

          // Format typeOfSector
          typeOfSector: {
            $cond: [
              { $ne: ["$typeOfSectorDetail", null] },
              {
                _id: "$typeOfSectorDetail._id",
                name: "$typeOfSectorDetail.name"
              },
              { _id: null, name: "" }
            ]
          },

          // Format promoterDetail with nested lookup fields
          promoterDetail: {
            $cond: [
              { $ne: ["$promoterDetail", null] },
              {
                $mergeObjects: [
                  "$promoterDetail",
                  {
                    languagePreferenceId: {
                      $cond: [
                        { $ne: ["$promoterLanguageDetail", null] },
                        {
                          _id: "$promoterLanguageDetail._id",
                          name: "$promoterLanguageDetail.name"
                        },
                        { _id: null, name: "" }
                      ]
                    },
                    qualificationId: {
                      $cond: [
                        { $ne: ["$promoterQualificationDetail", null] },
                        {
                          _id: "$promoterQualificationDetail._id",
                          name: "$promoterQualificationDetail.name"
                        },
                        { _id: null, name: "" }
                      ]
                    }
                  }
                ]
              },
              null
            ]
          },

          // Format managementDetail with nested lookup fields
          managementDetail: {
            $cond: [
              { $ne: ["$managementDetail", null] },
              {
                $mergeObjects: [
                  "$managementDetail",
                  {
                    languagePreferenceId: {
                      $cond: [
                        { $ne: ["$managementLanguageDetail", null] },
                        {
                          _id: "$managementLanguageDetail._id",
                          name: "$managementLanguageDetail.name"
                        },
                        { _id: null, name: "" }
                      ]
                    },
                    qualificationId: {
                      $cond: [
                        { $ne: ["$managementQualificationDetail", null] },
                        {
                          _id: "$managementQualificationDetail._id",
                          name: "$managementQualificationDetail.name"
                        },
                        { _id: null, name: "" }
                      ]
                    }
                  }
                ]
              },
              null
            ]
          },

          // Format userId
          userId: {
            name: { $ifNull: ["$userInfo.employeName", ""] },
            email: { $ifNull: ["$userInfo.email", ""] },
            userName: { $ifNull: ["$userInfo.userName", ""] },
            _id: { $ifNull: ["$userInfo._id", null] }
          },
          allocatedModule: {
            $map: {
              input: "$allocatedModule",
              as: "item",
              in: {
                _id: "$$item._id",
                Name: "$$item.Name",
                Cost: "$$item.Cost",
                status: "$$item.status"
              }
            }
          }
        }
      },

      // Remove unwanted fields
      {
        $project: {
          plandetail: 0,
          employees: 0,
          userInfo: 0,
          typeOfOrganizationDetail: 0,
          // defaultCurrenyDetail:0,
          typeOfIndustryDetail: 0,
          currenyDetail: 0,
          typeOfSectorDetail: 0,
          promoterLanguageDetail: 0,
          promoterQualificationDetail: 0,
          managementLanguageDetail: 0,
          managementQualificationDetail: 0
        }
      }
    ]);

    return success(res, "Organizations fetched", orgs);
  } catch (error) {
    return unknownError(res, error);
  }
};

// GET BY ID
export const getOrganizationById = async (req, res) => {
  try {
    const org = await OrganizationModel.findById(req.params.id)
      .populate("typeOfOrganization", "name").populate("typeOfIndustry", "name").populate("typeOfSector", "name")
      .populate("userId", "name email").populate("promoterDetail.languagePreferenceId", "name")
      .populate("promoterDetail.qualificationId", "name")
      .populate("managementDetail.languagePreferenceId", "name")
      .populate("managementDetail.qualificationId", "name")
      .populate("defaultCurreny", "name icon");
    // .populate("defaultCurrenyId", "name")

    if (!org) return notFound(res, "Organization not found");

    const employees = await employeeModel.find(
      { organizationId: org._id },
      "userName"
    );
    const response = {
      ...org.toObject(),
      employees: employees,
    };
    return success(res, "Organization fetched", response);
  } catch (error) {
    return unknownError(res, error);
  }
};

export const updateOrganizationPermission = async (req, res) => {
  try {
    const { organizationId, permission } = req.body;

    if (!organizationId || !mongoose.isValidObjectId(organizationId)) {
      return badRequest(res, "Valid organizationId is required.");
    }
    if (!permission || typeof permission !== "object" || Array.isArray(permission)) {
      return badRequest(res, "permission must be an object of boolean flags.");
    }

    // build dot‑notation update for *every* key
    const update = {};
    for (const [key, value] of Object.entries(permission)) {
      if (typeof value !== "boolean") {
        return badRequest(res, `Value for "${key}" must be boolean.`);
      }
      update[`permission.${key}`] = value;
    }

    const org = await OrganizationModel.findByIdAndUpdate(
      organizationId,
      { $set: update },
      { new: true, projection: { permission: 1 } }
    );
    if (!org) return notFound(res, "Organization not found.");

    return success(res, "Permissions updated successfully.", org.permission);
  } catch (err) {
    return unknownError(res, err);
  }
};

// UPDATE
export const updateOrganization = async (req, res) => {
  try {
    const updated = await OrganizationModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return notFound(res, "Organization not found");
    return success(res, "Organization updated", updated);
  } catch (error) {
    return unknownError(res, error);
  }
};

// DELETE
export const deleteOrganization = async (req, res) => {
  try {
    const deleted = await OrganizationModel.findByIdAndDelete(req.params.id);
    if (!deleted) return notFound(res, "Organization not found");
    return success(res, "Organization deleted", deleted);
  } catch (error) {
    return unknownError(res, error);
  }
};


export const getCurrencyList = async (req, res) => {
  try {
    const { status } = req.query;

    let matchStatus = {};

    if (status && status !== "all") {
      matchStatus.status = status;
    } else if (!status || status === "active") {
      matchStatus.status = "active";
    }

    const currencyList = await currencyModel.find(matchStatus);

    return success(res, "Currency list", currencyList);
  } catch (error) {
    return unknownError(res, error);
  }
};



export const checkOrganizationValid = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const orgExists = await OrganizationModel.exists({ _id: organizationId });


    return success(res, "Organization validation result", {
      valid: !!orgExists,
    });
  } catch (error) {
    return unknownError(res, error);
  }
};




// var currencySeedData = [
//   { code: "USD", name: "United States Dollar", symbol: "$" },
//   { code: "EUR", name: "Euro", symbol: "€" },
//   { code: "INR", name: "Indian Rupee", symbol: "₹" },
//   { code: "GBP", name: "British Pound Sterling", symbol: "£" },
//   { code: "JPY", name: "Japanese Yen", symbol: "¥" },
//   { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
//   { code: "CAD", name: "Canadian Dollar", symbol: "$" },
//   { code: "AUD", name: "Australian Dollar", symbol: "$" },
//   { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
//   { code: "SGD", name: "Singapore Dollar", symbol: "$" },
//   { code: "NZD", name: "New Zealand Dollar", symbol: "$" },
//   { code: "ZAR", name: "South African Rand", symbol: "R" },
//   { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ" },
//   { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
//   { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
//   { code: "SEK", name: "Swedish Krona", symbol: "kr" },
//   { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
//   { code: "DKK", name: "Danish Krone", symbol: "kr" },
//   { code: "THB", name: "Thai Baht", symbol: "฿" },
//   { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
//   { code: "KRW", name: "South Korean Won", symbol: "₩" },
//   { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
//   { code: "PHP", name: "Philippine Peso", symbol: "₱" },
//   { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" }
// ];


// export const getCurrencyList = async (req, res) => {
//   try {
//     const existing = await CurrencyModel.find({});
//     if (existing.length > 0) {
//       return res.status(400).json({ message: "Currency data already seeded." });
//     }

//     const currencies = currencySeedData.map((item) => ({
//       name: item.code,
//       icon: item.symbol,
//       status: "active",
//     }));

//     const saved = await CurrencyModel.insertMany(currencies);
//     return res.status(200).json({
//       message: "Currency data seeded successfully.",
//       data: saved,
//     });
//   } catch (error) {
//     console.error("Error seeding currency data:", error);
//     return res.status(500).json({ message: "Failed to seed currency data." });
//   }
// };
