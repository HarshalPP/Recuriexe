import mongoose from "mongoose";
import budgetFavoriteModel from "../../models/dashboardFavouriteModel/budgetFavorite.model.js"
import {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
} from "../../formatters/globalResponse.js"

export const addBudgetFavoriteDashboard = async (req, res) => {
    try {
        const { departmentId, subDepartmentId, designationId , name } = req.body;
        const employeeId = req.employee.id; 

        console.log('departmentId, subDepartmentId, designationId',departmentId, subDepartmentId, designationId)
        const existing = await budgetFavoriteModel.findOne({
            name,
            employeeId,
            departmentId,
            subDepartmentId,
            designationId,
        });

        if (existing) {
            return badRequest(res, "Already added as favorite.");
        }

        const favorite = await budgetFavoriteModel.create({
            name,
            employeeId,
            departmentId,
            subDepartmentId,
            designationId,
        });

        return success(res, "Favorite added successfully", favorite);
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};


export const getEmployeeBudgetFavorites = async (req, res) => {
  try {
    const employeeId = req.employee.id;

    const favorites = await budgetFavoriteModel.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(employeeId)
        }
      },

      // Get department details
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },

      // Get designation details
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation"
        }
      },

      // Lookup for subDepartments from newdepartments.subDepartments
      {
        $lookup: {
          from: "newdepartments",
          let: { subIds: "$subDepartmentId" },
          pipeline: [
            { $unwind: "$subDepartments" },
            {
              $match: {
                $expr: { $in: ["$subDepartments._id", "$$subIds"] }
              }
            },
            {
              $project: {
                _id: "$subDepartments._id",
                name: "$subDepartments.name"
              }
            }
          ],
          as: "subDepartments"
        }
      },

      {
        $project: {
          name: 1,
          department: { _id: 1, name: 1 },
          subDepartments: 1,
          designation: { _id: 1, name: 1 }
        }
      }
    ]);

    return success(res, "Favorites list", favorites);
  } catch (error) {
    console.error(error);
    return unknownError(res, error);
  }
};


export const removeBudgetFavoriteDashboard = async (req, res) => {
    try {
        const { favoriteId } = req.query;

        if(!favoriteId){
            return badRequest(res, "Favorite Id Required");
        }
        const employeeId = req.employee.id;

        const deleted = await budgetFavoriteModel.findOneAndDelete({
            _id: favoriteId,
            employeeId
        });

        if (!deleted) {
            return badRequest(res, "Favorite not found");
        }

        return success(res, "Favorite removed successfully");
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
};
