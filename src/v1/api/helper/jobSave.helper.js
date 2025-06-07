import jobSaveModel from '../models/jobPostModel/jobSave.model.js';
import userModel from '../models/AuthModel/auth.model.js'
import { jobSaveFormatter } from '../formatters/jobSave.formatter.js';
import { returnFormatter } from '../formatters/common.formatter.js';
// import admin from '../services/notification/firebaseNotification.js';

//------------------------------------ Job Save ------------------------------------//


export async function jobSaveAddRemoveById(requestObject) {
    try {

        const { userId, jobPostId } = requestObject.body;
        if (!userId) {
            return returnFormatter(false, "user Id are required");
        }
        if (!jobPostId) {
            return returnFormatter(false, "job Post Id are required");
        }
        const formattedData = jobSaveFormatter(requestObject.body);
        const existing = await jobSaveModel.findOne({ userId, jobPostId });
        if (existing) {
            await jobSaveModel.deleteOne({ _id: existing._id });
            return returnFormatter(true, "Job removed", null);
        } else {
            const created = await jobSaveModel.create(formattedData);
            return returnFormatter(true, "Job Save", created);
        }

    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

//------------------------------------ Job Save Get ------------------------------------//

export async function jobSaveById(requestObject) {
    try { 
        const { userId } = requestObject.query

        const userFind = await userModel.findById({_id:userId,status:"active" })
        if(!userFind){
           return returnFormatter(true, "User Not Found", null);
        }
        const jobSaveGet = await jobSaveModel.find({ userId })
            .populate({
                path: "userId",
                select: "mobileNumber email userName" // select specific user fields
            })
            .populate({
                path: "jobPostId",
                populate: [
                    { path: "employmentTypeId", select: "title" },
                    { path: "departmentId", select: "name" },
                    { path: "branchId", select: "name" },
                    { path: "jobDescriptionId", select: "jobDescription position" },
                    { path: "vacencyRequestId", select: "experience" }
                ]
            })
            .lean()
        return returnFormatter(true, "job Save List", jobSaveGet);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}