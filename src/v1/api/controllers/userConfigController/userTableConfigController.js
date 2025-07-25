// controllers/userTableConfigController.js

import  UserTableConfig  from "../../models/UserTableConfig/userTableConfig.model.js"
import { success, badRequest, unknownError } from '../../formatters/globalResponse.js'

// const defaultKeys = [
//   "Checkbox selection", "ID", "Candidate Name", "Contact", "Email", "Locations",
//   "Department", "Sub-Department", "Position", "Qualification", "Last Organisation",
//   "Applied Date", "Resume" , "View Profile"
// ];

// GET or CREATE
// export const getUserTableConfig = async (req, res) => {
//   try {
//     const { type } = req.query;
//     const employeeId = req.employee.id;
//     const orgainizationId = req.employee.organizationId;

//     if (!type || !['column', 'freeze'].includes(type)) {
//       return badRequest(res, "Type must be 'column' or 'freeze'");
//     }

//     let config = await UserTableConfig.findOne({ employeeId, orgainizationId, type });

//     if (!config) {
//       config = await UserTableConfig.create({
//         employeeId,
//         orgainizationId,
//         type,
//         config: defaultKeys.map(key => ({ key, active: true })),
//       });
//     }

//     return success(res, "Fetched user table config", config);

//   } catch (error) {
//     console.error("Error in getUserTableConfig:", error);
//     unknownError(res, error);
//   }
// };



export const getUserTableConfig = async (req, res) => {
  try {
    const { type } = req.query;
    const employeeId = req.employee.id;

     const orgainizationId = req.employee.organizationId;

    const defaultKeys = [
      "Checkbox selection", "ID", "Candidate Name", "Contact", "Email",
      "Locations", "Department", "Sub-Department", "Position",
      "Qualification", "Last Organisation", "Applied Date", "Resume" , "Expected CTC" , "Remark" , "Resume Decision" , "Schedule" , "Document Status" , "Request Document" , "Offer Letter Status" , "Offer Letter" , "Generate Offer Letter" , "Verification Status" , "Verification Report"
    ];

    const createDefaultConfig = async (configType) => {
      const defaultActive = configType == 'freeze' ? false : true;

      return await UserTableConfig.create({
        employeeId,
        orgainizationId,
        type: configType,
        config: defaultKeys.map(key => ({ key, active: defaultActive })),
      });
    };

    // CASE 1: If type is provided (column or freeze)
    if (type) {
      if (!['column', 'freeze'].includes(type)) {
        return badRequest(res, "Type must be 'column' or 'freeze'");
      }

      let config = await UserTableConfig.findOne({ employeeId, orgainizationId, type });

      if (!config) {
        config = await createDefaultConfig(type);
      }

      return success(res, "Fetched user table config", { [type]: config });
    }

    // CASE 2: No type provided → return and ensure both column & freeze exist
    let [columnConfig, freezeConfig] = await Promise.all([
      UserTableConfig.findOne({ employeeId, orgainizationId, type: 'column' }),
      UserTableConfig.findOne({ employeeId, orgainizationId, type: 'freeze' })
    ]);

    if (!columnConfig) {
      columnConfig = await createDefaultConfig('column');
    }

    if (!freezeConfig) {
      freezeConfig = await createDefaultConfig('freeze');
    }

    return success(res, "Fetched all user table config", {
      column: columnConfig,
      freeze: freezeConfig
    });

  } catch (error) {
    console.error("Error in getUserTableConfig:", error);
    unknownError(res, error);
  }
};


// UPDATE specific keys
export const updateUserTableConfig = async (req, res) => {
  try {
    const { type, updates } = req.body;
    const employeeId = req.employee.id;
    const orgainizationId = req.employee.organizationId;
    console.log("orgainizationId" , orgainizationId)

    if (!type || !Array.isArray(updates)) {
      return badRequest(res, "Invalid payload");
    }

    let configDoc = await UserTableConfig.findOne({ employeeId, orgainizationId, type });

    if (!configDoc) {
      configDoc = await UserTableConfig.create({
        employeeId,
        orgainizationId,
        type,
        config: defaultKeys.map(key => ({ key, active: true })),
      });
    }

    for (const update of updates) {
      const item = configDoc.config.find(c => c.key == update.key);
      if (item) item.active = update.active;
    }

    await configDoc.save();
    return success(res, "Updated user config", configDoc);

  } catch (error) {
    console.error("Error in updateUserTableConfig:", error);
    unknownError(res, error);
  }
};
