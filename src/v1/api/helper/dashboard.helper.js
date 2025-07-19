import mongoose from "mongoose";
import { returnFormatter } from "../formatters/common.formatter.js";
import initModel from "../models/initModel/init.model.js";
import employeeModel from "../models/employeemodel/employee.model.js";
import partnerRequestModel from "../models/partnerRequestModel/partnerRequest.model.js";
import serviceModel from "../models/serviceModel/service.model.js";
import { getAllPartners } from "./partnerRequest.helper.js";
import companyModel from "../models/companyModel/company.model.js";
import { addVariableAuto } from "./variable.helper.js";
import roleModel from "../models/RoleModel/role.model.js";






//----------------------------   get all Count ------------------------------

export async function getallCount(requestsObject) {
  try {
    const organizationId = requestsObject.employee.organizationId;

    // Use countDocuments for counts instead of find()
    const allCount = await initModel.countDocuments({ organizationId });
    const allocatedCount = await initModel.countDocuments({ organizationId, workStatus: "allocated" });
    const backOfficeReceivedCount = await initModel.countDocuments({ organizationId, workStatus: "backofficereceived" });
    const wipCount = await initModel.countDocuments({ organizationId, workStatus: "wip" });
    const completedCount = await initModel.countDocuments({ organizationId, workStatus: "reportgenerated" });

    const clientCount = await partnerRequestModel.countDocuments({ senderId: organizationId, status: "accepted" });
    const empCount = await employeeModel.countDocuments({ organizationId });

    const data = {
      allCount,
      allocatedCount,
      backOfficeReceivedCount,
      wipCount,
      completedCount,
      clientCount,
      empCount,
    };

    return returnFormatter(true, "all count data", data);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}



//----------------------------   get ad cases Count ------------------------------

export async function getAdCases(requestsObject) {
    try {

        const  data = await initModel.find({organizationId:requestsObject.employee.organizationId,workStatus:"allocated"})


        return returnFormatter(true, "Stage count data", data.length?data.length:0);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}


//----------------------------   get backofficeCount ------------------------------

export async function getBackOfficeCount(requestsObject) {
    try {

        const  data = await initModel.find({organizationId:requestsObject.employee.organizationId,workStatus:"allocated"})

        return returnFormatter(true, "Stage count data",  data.length?data.length:0);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

//----------------------------   get backofficeCount ------------------------------

export async function getBackOfficeWipCount(requestsObject) {
    try {

        const  data = await initModel.find({organizationId:requestsObject.employee.organizationId,workStatus:"wip"})

        return returnFormatter(true, "Stage count data",  data.length?data.length:0);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}




//----------------------------   get backoffice completed Count  ------------------------------

export async function getBackOfficeCompletedCount(requestsObject) {
    try {

        const  data  = await initModel.find({organizationId:requestsObject.employee.organizationId,workStatus:"reportgenerated"})

        return returnFormatter(true, "Stage count data",  data.length?data.length:0);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

//---------------------------- get vendor count  ------------------------------

export async function getClientCount(requestsObject) {
  try {
    // Fetch all employees under the specified serviceId
    let request = await partnerRequestModel.find({senderId:requestsObject.employee.organizationId,status:"accepted"});

    return returnFormatter(true, "Task count data", request.length?request.length:0);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


//---------------------------- Task emp wise   ------------------------------

export async function getTaskCountByEmp(requestsObject) {
  try {
    // Fetch all employees under the specified serviceId
    let employees = await employeeModel.find({ organizationId: requestsObject.employee.organizationId });

    let results = [];

    // For each employee, calculate allocated and completed counts
    for (let emp of employees) {
      let allocatedCount = await initModel.countDocuments({ allocatedOfficeEmp: emp._id,workStatus:"allocated" });
      let completedCount = await initModel.countDocuments({
        allocatedOfficeEmp: emp._id,
        workStatus: "reportgenerated"
      });

      results.push({
        name: emp.fullName, // adjust if name is different
        allocated: allocatedCount,
        completed: completedCount
      });
    }

    return returnFormatter(true, "Task count data", results);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

//---------------------------- Task emp wise   ------------------------------

export async function getTaskCountByPartners(requestsObject) {
  try {
    // Fetch all employees under the specified serviceId
    let reqData = await getAllPartners(requestsObject);

    let results = [];

    // For each employee, calculate allocated and completed counts
    for (let req of reqData.data) {
      let allocatedCount = await initModel.countDocuments({ partnerId:req.partner._id,workStatus:"allocated" });
      let completedCount = await initModel.countDocuments({
        partnerId:req.partner._id,
        workStatus: "reportgenerated"
      });

      results.push({
        name: req.partner.fullName, // adjust if name is different
        allocated: allocatedCount,
        completed: completedCount
      });
    }

    return returnFormatter(true, "Task count data", results);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}



//---------------------------- Task report wise   ------------------------------

export async function getTaskCountByService(requestsObject) {
  try {
    // Fetch all employees under the specified serviceId
    let allServices = await serviceModel.find({ organizationId: requestsObject.employee.organizationId });

    let results = [];

    // For each employee, calculate allocated and completed counts
    for (let service of allServices) {
      let allocatedCount = await initModel.countDocuments({ referServiceId: service._id,workStatus:"allocated" });
      let wipCount = await initModel.countDocuments({ referServiceId: service._id,reportStatus:"wip" });
      let completedCount = await initModel.countDocuments({
        referServiceId: service._id,
        workStatus: "reportgenerated"
      });

      results.push({
        name: service.serviceName, // adjust if name is different
        allocated: allocatedCount,
        wipCount,
        completed: completedCount
      });
    }

    return returnFormatter(true, "Task count data", results);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


//---------------------------- employee count  ------------------------------

export async function getEmpCount(requestsObject) {
  try {
   
    let emp = await employeeModel.countDocuments({organizationId:requestsObject.employee.organizationId})

    return returnFormatter(true, "Task count data", emp);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}



//--------------------------- get cases report count ----------------------------------


export async function getAllForBackOfficeData(reqObj) {
    try {

        const query = {
            organizationId: new mongoose.Types.ObjectId(reqObj.employee.organizationId),
        };
        let role = await roleModel.findById(reqObj.employee.roleId);
       
        if (role.roleName=="SuperAdmin") {
            // Add `allocatedOfficeEmp` conditionally
            query.allocatedOfficeEmp = new mongoose.Types.ObjectId(reqObj.employee.id);
        }


        if (reqObj.query?.partnerId) {
            query.partnerId = reqObj.query.partnerId;
        }

        if (reqObj.query?.serviceId) {
            query.referServiceId = reqObj.query.serviceId;
        }

        // Date filter handling
        if (reqObj.query?.dateFilter) {
            const now = new Date();
            let startDate, endDate;

            switch (reqObj.query.dateFilter) {
                case "today":
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    endDate = new Date(now.setHours(23, 59, 59, 999));
                    break;
                case "thisWeek":
                    const firstDayOfWeek = new Date(now);
                    firstDayOfWeek.setDate(now.getDate() - now.getDay());
                    firstDayOfWeek.setHours(0, 0, 0, 0);
                    startDate = firstDayOfWeek;
                    endDate = new Date(); // now
                    break;
                case "thisMonth":
                    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = firstDayOfMonth;
                    endDate = new Date(); // now
                    break;
                case "custom":
                    if (reqObj.query.startDate && reqObj.query.endDate) {
                        startDate = new Date(reqObj.query.startDate);
                        endDate = new Date(reqObj.query.endDate);
                        endDate.setHours(23, 59, 59, 999);
                    }
                    break;
            }

            if (startDate && endDate) {
                query.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }

        const initData = await initModel.find({...query,workStatus:"reportgenerated"})
            .populate({ path: "partnerId", model: "Organization", options: { strictPopulate: false } })
            .populate({ path: "doneBy", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "allocatedOfficeEmp", model: "employee", options: { strictPopulate: false } })
            .populate({ path: "referServiceId", model: "service", options: { strictPopulate: false } })
            .populate({ path: "reportType", model: "userProduct", options: { strictPopulate: false } })

            .sort({ createdAt: -1 });

        if (!initData.length) {
            return returnFormatter(true, "No init data found", []);
        }

        const company = await companyModel.findOne({ organizationId: new mongoose.Types.ObjectId(reqObj.employee.organizationId) });

        const partnerId = initData[0]?.partnerId?._id || initData[0]?.partnerId;
        const organizationId = new mongoose.Types.ObjectId(reqObj.employee.organizationId);

        const requestData = await partnerRequestModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: partnerId, receiverId: organizationId },
                        { senderId: organizationId, receiverId: partnerId }
                    ]
                }
            }
        ]).sort({ createdAt: -1 });

        const mergedData = initData.map(init => ({
            ...init.toObject(),
            company,
            requestData: requestData[0] || null
        }));

        await addVariableAuto(reqObj);


        return returnFormatter(true, "Init data with emp retrieved", mergedData);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
