import JobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"
import { badRequest, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"
import newDepartmentModel from "../../models/deparmentModel/deparment.model.js"


// create job description //
export const createJobDescriptionService = async (data , organizationId) => {

  const jobDescription = await JobDescriptionModel.create({
    ...data,
    organizationId,
  });
  return jobDescription;
};


// get job description //

// export const getjobdes = async(organizationId)=>{
//     return await JobDescriptionModel.find({ organizationId })
//     .populate({
//       path:'designationId',
//       select:'name'
//     })
//     .populate({
//       path:'createdById',
//       select:'employeName'
//     })
//      .populate({
//       path: 'subdeparmentId', // Correct the spelling if it's supposed to be subdepartmentId
//       select: 'name', // Assuming subdepartment has a 'name' field
//     })
//     .sort({ createdAt: -1 });
// }


export const getjobdes = async (organizationId) => {
  const jobDescriptions = await JobDescriptionModel.find({ organizationId })
    .populate({
      path: 'designationId',
      select: 'name',
    })
    .populate({
      path: 'createdById',
      select: 'employeName',
    })
    .populate({
      path:'departmentId',
      select: 'name',
    })
    .sort({ createdAt: -1 });

  // Fetch departments to find subdepartment names
  const departments = await newDepartmentModel.find({ organizationId });

  // Map of subdepartmentId to subdepartment object
  const subDeptMap = {};
  departments.forEach((dept) => {
    dept.subDepartments.forEach((sub) => {
      subDeptMap[sub._id.toString()] = sub.name;
    });
  });

  // Log or process internally without modifying API response
  jobDescriptions.forEach(job => {
    const subDeptId = job.subdeparmentId?.toString();
    if (subDeptId && subDeptMap[subDeptId]) {
      const subDeptName = subDeptMap[subDeptId];
      // You can log or use this internally without changing the response
      console.log(`Subdepartment for job ${job._id}: ${subDeptName}`);
      // You may also attach it to a non-serialized field like:
      job._doc._subDepartmentName = subDeptName;
    }
  });

  return jobDescriptions;
};

// Update description //

export const updateJobDescription = async (jobDescriptionId, updateData, updatedById) => {
    // const existing = await JobDescriptionModel.findOne({ position: updateData.position });
    updateData.updatedById = updatedById;
  
    const updated = await JobDescriptionModel.findByIdAndUpdate(jobDescriptionId, updateData, {
      new: true,
    });
  
    return updated;
  };

