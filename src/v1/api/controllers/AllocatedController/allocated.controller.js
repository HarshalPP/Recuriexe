import AllocatedModule from "../../models/AllocatedModel/Allocated.model.js"
import * as formatter from "../../formatters/allocated.formatter.js"
import {
  success,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  serverValidation,
  unknownError,
  validation,
  alreadyExist,
  sendResponse,
  invalid,
  onError
} from "../../../../../src/v1/api/formatters/globalResponse.js"


export const createAllocated = async (req, res) => {
    try {
        const payload = req.body;

        // Check if array or single object
        if (Array.isArray(payload)) {
            const dataArray = payload.map(formatter.extractCreateParams); // validate each item
            const result = await AllocatedModule.insertMany(dataArray);
            return success(res, "Multiple allocations created successfully", result);
        } else {
            const data = formatter.extractCreateParams(payload);
            const allocated = new AllocatedModule(data);
            const result = await allocated.save();
            return success(res, "Allocated created successfully", result);
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
};

export const getAllAllocated = async (req, res) => {
    try {
        const result = await AllocatedModule.find({status: "active"});
        return success(res, "Allocated fetched successfully", result);
    } catch (error) {
        return globalResponse.error(res, error.message);
    }
};

export const getAllocatedById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AllocatedModule.findById(id);
        if(!result){
            return badRequest(res, "Allocated not found");
        }
       return success(res, "Allocated fetched successfully", result);
    } catch (error) {
        return unknownError(res, error.message);
    }
};

export const updateAllocated = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = formatter.extractUpdateParams(req.body);
        const result = await AllocatedModule.findByIdAndUpdate(id, updates, { new: true });

        if (!result) {
            return badRequest(res, "Allocated not found");
        }

        return success(res, "Allocated updated successfully", result);

    } catch (error) {
        return globalResponse.error(res, error.message);
    }
};

export const deleteAllocated = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AllocatedModule.findByIdAndDelete(id);
        if (!result) {
            return badRequest(res, "Allocated not found");
        }
        return success(res, "Allocated deleted successfully", result);
    } catch (error) {
        return globalResponse.error(res, error.message);
    }
};
