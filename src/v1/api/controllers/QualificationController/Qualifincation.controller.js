import Qualification from "../../models/QualificationModel/qualification.model.js"
import jobApplyModel from "../../models/jobPostModel/jobPost.model.js"
import { formatQualification } from '../../formatters/qualification.formatter.js';
import {
  success,
  created,
  notFound,
  badRequest,
  unknownError
} from '../../formatters/globalResponse.js';
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// Create
export const createQualification = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const data = formatQualification(req.body);
    data.organizationId = organizationId
    const qualification = await Qualification.create(data);
    return created(res, 'Qualification added successfully', qualification);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

// Read All with optional search
export const getAllQualifications = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const searchTerm = req.query.search || '';
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive search

    const qualifications = await Qualification.find({
      organizationId: organizationId,
      isActive: true,
      name: { $regex: regex }
    });

    return success(res, 'Fetched qualifications successfully', qualifications);
  } catch (err) {
    return unknownError(res, err.message);
  }
};


// Get by ID
export const getQualificationById = async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);
    if (!qualification) return success(res ,"fetch Qualification")
    return success(res, 'Qualification found', qualification);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

// Update
export const updateQualification = async (req, res) => {
  try {
    const data = formatQualification(req.body);
    const qualification = await Qualification.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    if (!qualification) return notFound(res, 'Qualification not found');
    return success(res, 'Updated successfully', qualification);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

// Soft Delete
export const deleteQualification = async (req, res) => {
  try {
    const qualification = await Qualification.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!qualification) return notFound(res, 'Qualification not found');
    return success(res, 'Qualification deactivated');
  } catch (err) {
    return unknownError(res, err.message);
  }
};

// Soft Delete
export const jobApplyUsedQualification = async (req, res) => {
  try {


    const organizationId = req.query.organizationId;

    if(!organizationId){
      return badRequest(res , "OrganizationId Is Required")
    }

    // Step 1: Fetch jobApply entries for this organization
   const jobApplies = await jobApplyModel.find({
      organizationId: new ObjectId(organizationId)
    }).select("qualificationId");

  const allQualificationIds = jobApplies
      .flatMap(d => Array.isArray(d.qualificationId) ? d.qualificationId : [d.qualificationId])
      .filter(Boolean)
      .map(id => new ObjectId(id)); // ensure they are valid ObjectId

    const uniqueQualificationIds = [...new Set(allQualificationIds.map(id => id.toString()))]
      .map(id => new ObjectId(id)); // convert back to ObjectId

    // Step 3: Query Qualification model using those IDs
    const qualifications = await Qualification.find({
      _id: { $in: uniqueQualificationIds },
      organizationId: new ObjectId(organizationId)
    })

    return success(res, "Qualification deactivated and dropdown updated", qualifications);
  } catch (err) {
    return unknownError(res, err.message);
  }
};