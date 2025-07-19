const branchModel = require("../model/adminMaster/branch.model")
const companyModel = require("../model/adminMaster/company.model")
const costCenterModel = require("../model/adminMaster/costCenter.model")
const departmentModel = require("../model/adminMaster/department.model")
const designationModel = require("../model/adminMaster/designation.model")
const employeModel = require("../model/adminMaster/employe.model")
const workLocationModel = require("../model/adminMaster/workLocation.model")
const customerModel = require("../model/customer.model")

async function processHierarchy() {

  // const branchData = await costCenterModel.deleteMany({"_id":{ $ne: "66c9a8cdc3aad871d3130c86" }})
  // const updateData = await employeModel.updateMany({}, {
  //   "companyId": "66c9a31dc3aad871d3130c6f",
  //   "branchId": "66c9a702c3aad871d3130c71",
  //   "departmentId": "66c9a7fac3aad871d3130c7a",
  //   "workLocationId": "66c9a7b5c4aaa3af4a0b9326",

  //   designationId: "66c9aa5fc3aad871d3130c89"

  // })
  const companyData = await companyModel.find().select("_id")
  const branchData = await branchModel.find().select("_id companyId")
  const workLocationData = await workLocationModel.find().select("_id companyId branchId")
  const departmentData = await departmentModel.find().select("_id companyId branchId workLocationId")
  const designationData = await designationModel.find().select("_id companyId branchId workLocationId departmentId")

  // const companyData = companyModel.aggregate([
  //   {
  //     $lookup: {
  //       from: "branches",
  //       localField: "_id",
  //       foreignField: "companyId",
  //       as: "branchList",
  //       pipeline: [{
  //         $lookup: {
  //           from: "worklocations",
  //           localField: "_id",
  //           foreignField: "branchId",
  //           as: "workLocationList",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "designations",
  //                 localField: "_id",
  //                 foreignField: "workLocationId",
  //                 as: "designationList",
  //               },
  //             }
  //           ]
  //         },
  //       }]
  //     },
  //   },
  //   // {
  //   //   $lookup: {
  //   //     from: "branches",
  //   //     localField: "_id",
  //   //     foreignField: "companyId",
  //   //     as: "workLocationList",
  //   //   },
  //   // },
  //   // {
  //   //   $lookup: {
  //   //     from: "worklocations",
  //   //     localField: "_id",
  //   //     foreignField: "companyId",
  //   //     as: "departmentList",
  //   //   },
  //   // },
  //   // {
  //   //   $lookup: {
  //   //     from: "designations",
  //   //     localField: "_id",
  //   //     foreignField: "companyId",
  //   //     as: "designationList",
  //   //   },
  //   // }
  // ])

  return { companyData, branchData, workLocationData, departmentData, designationData }
}

module.exports = { processHierarchy }