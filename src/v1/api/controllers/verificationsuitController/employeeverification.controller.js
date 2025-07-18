
// controllers/gridlines/dlVerification.controller.js
import { verifyDLService , verifypanServices } from "../../services/grindlineservices/drivinglicence.service.js"
import { success, badRequest } from "../../formatters/globalResponse.js";
// import { DLErrorMessages } from "../../Utils/errorhandler.js"
// import {  trackApiUsage  } from "../../controllers/authcontrollers/auth.controller.js"



// verify Driving Licence //
export const verifyDLController = async (req, res) => {
  try {
    const { driving_license_number, date_of_birth, consent, source = 1 } = req.body;

    if (!driving_license_number || !date_of_birth || !consent) {
      return badRequest(res, "Driving license number, date of birth, and consent are required");
    }

    const { code, message, driving_license_data } = await verifyDLService({
      driving_license_number,
      date_of_birth,
      consent,
      source,
    });

    // await trackApiUsage(req.user._id, 110);

    return success(res, message, {
      code,
      driving_license_data,
    });

    
  } catch (error) {
    const mappedMessage = DLErrorMessages?.[error.code] || error.message || "Something went wrong";
    return badRequest(res, mappedMessage, {
      code: error.code || "INTERNAL_ERROR",
    });
  }
};



export const verifyPanController = async (req, res) => {
    try {
      const { pan_number, consent } = req.body;
  
      // Basic validation
      if (!pan_number || !consent) {
        return badRequest(res, "PAN number and consent are required");
      }
  
      const { code, message, pan_data } = await verifypanServices({
        pan_number,
        consent,
      });
  
      return success(res, message, {
        code,
        pan_data,
      });
  
    } catch (error) {
      const mappedMessage = PanErrorMessages?.[error.code] || error.message || "Something went wrong";
      return badRequest(res, mappedMessage, {
        code: error.code || "INTERNAL_ERROR",
      });
    }
  };



