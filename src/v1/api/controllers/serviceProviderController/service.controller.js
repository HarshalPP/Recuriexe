import { success, badRequest, notFound, unknownError } from "../../formatters/globalResponse.js"
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';
import serviceModel from "../../models/serviceModel/service.model.js";



export const createService = async (req, res) => {
  try {
    
        const newServicesData = await serviceModel.create({ ...req.body,  organizationId:req.employee.organizationId  });

    return success(res, "Service  created successfully");
  } catch (err) {
    return unknownError(res, err);
  }
};

export const getAllServices = async (req, res) => {
  try {
    const service = await serviceModel.find({organizationId:req.employee.organizationId });

    return success(res, "Services fetched successfully", service);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

export const getServicesById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await serviceModel.findById(id);

    if (!plan) {
      return notFound(res, "Data not found");
    }

    return success(res, "Service fetced succesfully", plan);
  } catch (err) {
    return unknownError(res, err.message);
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.body;

    const plan = await serviceModel.findById(id);

    if (!plan) {
      return notFound(res, "Data not found");
    }

      await serviceModel.findByIdAndUpdate(id,{...req.body})

    return success(res, "Data updated successfully");
  } catch (err) {
    return unknownError(res, err.message);
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await serviceModel.findByIdAndDelete(id);

    if (!plan) {
      return notFound(res, "Data not found");
    }

    return success(res, "Data deleted successfully", {});
  } catch (err) {
    return unknownError(res, err.message);
  }
};

