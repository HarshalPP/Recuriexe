const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// const workLocationModel = require("../../model/adminMaster/workLocation.model");
const employeeModel = require("../../model/adminMaster/employe.model");
const attendanceModel = require("../../model/adminMaster/attendance.model");
const moment = require("moment-timezone");
const workLocationModel = require("../../model/adminMaster/newWorkLocation.model");
const { sendEmail, hrmsSendEmail , sendEmployeeEmail  , sendManagerEmail } = require("../functions.Controller");
const cron = require("node-cron");
const policyModel = require("../../model/hrms/policy.model");
const employeeLeaveModel = require("../../model/hrms/employeeLeave.model");
const employmentTypeModel = require("../../model/adminMaster/employmentType.model");
const holidayModel = require("../../model/hrms/holiday.model");
const sundayModel = require("../../model/hrms/sundayworking.model")
const Branch = require("../../model/adminMaster/newBranch.model")
const ExcelJS = require("exceljs");
const processModel = require("../../model/process.model");
const externalVendorFormModel =  require("../../model/externalVendorForm.model");
const nodemailer = require("nodemailer");
const {generateAppointmentPDF} = require("../../controller/hrms/offerLetter.controller")
const regulationModel = require("../../model/adminMaster/regulation.model");
const branchModel = require("../../model/adminMaster/newBranch.model");
const attendanceChangeModel = require("../../model/adminMaster/attendanceChange.model");
const employmentNewTypeModel = require("../../model/adminMaster/employeType.model");
const taskModel = require("../../model/taskManagement/task.model");
const { changePunchInType } = require("../../helper/attendance.helper");

//----------------------------------------------------------
async function employeeAttendance(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const role = Array.isArray(req.roleName) ? req.roleName : [req.roleName];
    const employeeId = req.Id;
    const { latitude, longitude } = req.query;
    const todayTime = new Date();
    const todayStart = new Date(todayTime.setHours(0, 0, 0, 0));
    const todayEnd = new Date(todayTime.setHours(23, 59, 59, 999));
    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      return badRequest(res, "employee not found");
    }

    const employeeDetail = await workLocationModel.findOne({
      location: {
        $near: {
          $maxDistance: 500,
          $geometry: {
            type: "Point",
            coordinates: [latitude, longitude],
          },
        },
      },
      _id: employee.workLocationId,
    });

    let allowed;
    if (employeeDetail) {
      allowed = true;
    } else {
      allowed = false;
    }

    const existingAttendance = await attendanceModel
      .findOne({
        employeeId,
        date: { $gte: todayStart, $lte: todayEnd },
        approvalStatus: "approved",
      })
      .sort({ createdAt: -1 });
    let viewButton;

    // console.log('existingAttendance',existingAttendance)

    if (role.includes("sales") || role.includes("salesAndCollection")) {
      viewButton = false;
    } else {
      if (existingAttendance == null) {
        viewButton = true;
      } else if (existingAttendance.punchOutTime === undefined) {
        viewButton = false;
      } else {
        viewButton = true;
      }
    }
    console.log(
      "////////la long////////",
      latitude,
      longitude,
      "////////long ////////"
    );
    console.log(
      "////location//////",
      employeeDetail.location.coordinates,
      "///// locations //////"
    );
    success(res, "Attendance Checked", { allowed, viewButton });
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

const haversineDistance = (coords1, coords2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;

  const R = 6371000; // Radius of Earth in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

//--------------------------checking if the employee is in branch or not
// async function employeeAttendanceActiveByTrueFalse(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const now = moment().tz("Asia/Kolkata");
//     const employeeId = req.Id;
//     const { latitude, longitude } = req.query;

//     if (!latitude || !longitude) {
//       return badRequest(res, "Please provide proper Latitude and Longitude");
//     }

//     const todayStart = now.clone().startOf("day");
//     const todayEnd = now.clone().endOf("day");
//     const tomorrowSixAM = todayStart
//       .clone()
//       .add(1, "day")
//       .hour(6)
//       .minute(0)
//       .second(0);
//     const todaySixAM = todayStart.clone().hour(6).minute(0).second(0);

//     const utcTodayStart = todayStart.clone().utc();
//     const utcTodayEnd = todayEnd.clone().utc();
//     const utcTodaySixAM = todaySixAM.clone().utc();

//     const employeeExist = await employeeModel.findById(employeeId);
//     if (!employeeExist) {
//       return badRequest(res, "Employee not found");
//     }
//     const workLocation = await workLocationModel.findById(
//       employeeExist.workLocationId
//     );
//     if (!workLocation) {
//       return badRequest(res, "Work location not found");
//     }

//     const isWithinAllowedDistance = await workLocationModel.findOne({
//       location: {
//         $near: {
//           $maxDistance: 100,
//           $geometry: {
//             type: "Point",
//             coordinates: [latitude, longitude],
//           },
//         },
//       },
//       _id: employeeExist.workLocationId,
//     });

//     let allowedCheck = false;
//     const existingEmploymentType = await employmentTypeModel.findById(
//       employeeExist.employementTypeId
//     );
//     if (existingEmploymentType.punchOutsideBranch === "allowed") {
//       allowedCheck = true;
//     } else {
//       if (isWithinAllowedDistance) {
//         allowedCheck = true;
//       }
//     }

//     const existingAttendance = await attendanceModel.findOne({
//       employeeId,
//       date: {
//         $gte: utcTodayStart.toDate(),
//         $lte: utcTodayEnd.toDate(),
//       },
//     });

//     let punchInStatus = false;
//     let punchOutStatus = false;

//     // If current time is before 6 AM
//     if (now.isBefore(todaySixAM)) {
//       const previousDayStart = todayStart.clone().subtract(1, "day");
//       const previousDayEnd = todayEnd.clone().subtract(1, "day");

//       const previousAttendance = await attendanceModel.findOne({
//         employeeId,
//         date: {
//           $gte: previousDayStart.clone().utc().toDate(),
//           $lte: previousDayEnd.clone().utc().toDate(),
//         },
//       });

//       if (previousAttendance && previousAttendance.punchOutTime) {
//         punchInStatus = true;
//         punchOutStatus = true;
//       } else {
//         punchInStatus = false;
//         punchOutStatus = false;
//       }
//     }
//     // If current time is after 6 AM
//     else {
//       if (!existingAttendance) {
//         punchInStatus = false;
//         punchOutStatus = false;
//       } else {
//         if (existingAttendance.punchOutTime) {
//           punchInStatus = true;
//           punchOutStatus = true;
//         } else if (existingAttendance.punchInTime) {
//           punchInStatus = true;
//           punchOutStatus = false;
//         }
//       }
//     }

//     const punchInTimeIST = existingAttendance?.punchInTime || "";
//     const punchOutTimeIST = existingAttendance?.punchOutTime || "";
//     success(res, "Attendance status retrieved", {
//       allowed: allowedCheck,
//       viewButton: false,
//       punchIn: punchInStatus,
//       punchOut: punchOutStatus,
//       punchInTime: punchInTimeIST,
//       punchOutTime: punchOutTimeIST,
//     });
//     console.log(
//       "Work Location",
//       workLocation.location.coordinates,
//       "my current location",
//       latitude,
//       longitude
//     );
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error.message);
//   }
// }

async function employeeAttendanceActiveByTrueFalse(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const now = moment().tz("Asia/Kolkata");
    const employeeId = req.Id;
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return badRequest(res, "Please provide proper Latitude and Longitude");
    }

    const todayStart = now.clone().startOf("day");
    const todayEnd = now.clone().endOf("day");
    const tomorrowSixAM = todayStart
      .clone()
      .add(1, "day")
      .hour(6)
      .minute(0)
      .second(0);
    const todaySixAM = todayStart.clone().hour(6).minute(0).second(0);

    const utcTodayStart = todayStart.clone().utc();
    const utcTodayEnd = todayEnd.clone().utc();
    const utcTodaySixAM = todaySixAM.clone().utc();

    const employeeExist = await employeeModel.findById(employeeId);
    if (!employeeExist) {
      return badRequest(res, "Employee not found");
    }
    const workLocation = await workLocationModel.findById(
      employeeExist.workLocationId
    );
    if (!workLocation) {
      return badRequest(res, "Work location not found");
    }

    const isWithinAllowedDistance = await workLocationModel.findOne({
      location: {
        $near: {
          $maxDistance: 100,
          $geometry: {
            type: "Point",
            coordinates: [latitude, longitude],
          },
        },
      },
      _id: employeeExist.workLocationId,
    });

    let allowedCheck = false;
    const existingEmploymentType = await employmentTypeModel.findById(
      employeeExist.employementTypeId
    );
    if (existingEmploymentType.punchOutsideBranch === "allowed") {
      allowedCheck = true;
    } else {
      if (isWithinAllowedDistance) {
        allowedCheck = true;
      }
    }

    const existingAttendance = await attendanceModel.findOne({
      employeeId,
      date: {
        $gte: utcTodayStart.toDate(),
        $lte: utcTodayEnd.toDate(),
      },
    });

    let punchInStatus = false;
    let punchOutStatus = false;

    // Check today's taskModel entry by employeeId
    const taskToday = await taskModel.findOne({
      employeeId: employeeId,
      createdAt: { $gte: utcTodayStart.toDate(), $lte: utcTodayEnd.toDate() },
    });
    const bod = taskToday ? true : false;

    // If current time is before 6 AM
    if (now.isBefore(todaySixAM)) {
      const previousDayStart = todayStart.clone().subtract(1, "day");
      const previousDayEnd = todayEnd.clone().subtract(1, "day");

      const previousAttendance = await attendanceModel.findOne({
        employeeId,
        date: {
          $gte: previousDayStart.clone().utc().toDate(),
          $lte: previousDayEnd.clone().utc().toDate(),
        },
      });

      if (previousAttendance && previousAttendance.punchOutTime) {
        punchInStatus = true;
        punchOutStatus = true;
      } else {
        punchInStatus = false;
        punchOutStatus = false;
      }
    }
    // If current time is after 6 AM
    else {
      if (!existingAttendance) {
        punchInStatus = false;
        punchOutStatus = false;
      } else {
        if (existingAttendance.punchOutTime) {
          punchInStatus = true;
          punchOutStatus = true;
        } else if (existingAttendance.punchInTime) {
          punchInStatus = true;
          punchOutStatus = false;
        }
      }
    }

    const punchInTimeIST = existingAttendance?.punchInTime || "";
    const punchOutTimeIST = existingAttendance?.punchOutTime || "";
    success(res, "Attendance status retrieved", {
      allowed: allowedCheck,
      viewButton: false,
      punchIn: punchInStatus,
      punchOut: punchOutStatus,
      punchInTime: punchInTimeIST,
      punchOutTime: punchOutTimeIST,
      bodStatus: bod, // <=== added here
    });
    console.log(
      "Work Location",
      workLocation.location.coordinates,
      "my current location",
      latitude,
      longitude
    );
  } catch (error) {
    console.log(error);
    unknownError(res, error.message);
  }
}

// --------------------------------- One Time Punch IN AND Punch Out Ond Day -------------------------------------//

// working code //
// async function employeePunch(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const employeeId = req.Id;
//     const { action } = req.query;
//     const { latitude, longitude } = req.query; // Get location coordinates from request body

//     console.log('latitude, longitude=---- ',latitude, longitude)
//     if (!latitude || !longitude) {
//     return badRequest(res, "latitude and longitude Required");
//     }

//     let checkTime = moment().tz("Asia/Kolkata");

//     // const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

//     const todayStart = checkTime.clone().startOf("day").toDate(); // Start of the day in IST
//     const todayEnd = checkTime.clone().endOf("day").toDate();
//     const todayTime = checkTime.format("YYYY-MM-DDThh:mm:ss A");
//     // console.log("todayTime----", todayTime);
//     const employeeExist = await employeeModel.findById(employeeId);
//     if (!employeeExist) {
//       badRequest(res, "employee not found");
//     }

//     const startOfDayLimit = new Date(todayStart);
//     startOfDayLimit.setHours(6, 0, 0, 0); // Set to 6 AM

//     const existingAttendance = await attendanceModel.findOne({
//       employeeId,
//       date: { $gte: todayStart, $lte: todayEnd },
//       // createdAt: { $gte: startOfDayLimit, $lte: todayEnd },
//     }).sort({ createdAt: -1 });

//     let updatedAttendance;

//     const isWithinAllowedDistance = await workLocationModel.findOne({
//       location: {
//         $near: {
//           $maxDistance: 100,
//           $geometry: {
//             type: "Point",
//             coordinates: [latitude, longitude]
//           }
//         }
//       },
//       _id: employeeExist.workLocationId
//     })

//     if (action === "in") {
//       // console.log("existingAttendance---", existingAttendance);
//       // console.log("todayTime----", todayTime);
//       if (existingAttendance) {
//         return success(res, "Employee Already Punch In");
//       }
//       // Fetch work location
//       const workLocation = await workLocationModel.findById(
//         employeeExist.workLocationId
//       );
//       if (!workLocation) {
//         return badRequest(res, "Work location not found");
//       }

//       // const distance = haversineDistance(
//       //   [latitude, longitude],
//       //   [
//       //     workLocation.location.coordinates[1],
//       //     workLocation.location.coordinates[0],
//       //   ] // Note: [latitude, longitude]
//       // );
//       // // console.log(distance);

//       let punchInFrom;

//       // console.log('isWithinAllowedDistance', isWithinAllowedDistance)
//       if (isWithinAllowedDistance) {
//         punchInFrom = "branch";
//       } else{
//         return badRequest(res, "You Are OutSide");
//         // punchInFrom = "outsideBranch";
//       }

//       // console.log('distance', distance)
//       // if (distance <= 100) {
//       //   punchInFrom = "branch";
//       // } else if (distance >= 100) {
//       //   punchInFrom = "outsideBranch";
//       // }
//       updatedAttendance = await attendanceModel.create({
//         employeeId: employeeId,
//         date: checkTime,
//         approvalStatus: 'approved',
//         punchInTime: todayTime,
//         punchInFrom: punchInFrom,
//         locationPunchIn: {
//           type: "Point",
//           coordinates: [longitude, latitude],
//         },
//       });
//     } else if (action === "out") {
//       // console.log("existingAttendance-----", existingAttendance);
//       // console.log("todayTime-----", todayTime);
//       if (!existingAttendance) {
//         return badRequest(res, "Employee Not Punch In");
//       }
//       if (existingAttendance.punchOutTime) {
//         return success(res, "Employee Already Punch Out");
//       }

//       if (!isWithinAllowedDistance) {
//       return badRequest(res, "You Are OutSide");
//       }

//       // console.log('-out check ',todayTime )

//       updatedAttendance = await attendanceModel
//         .findOneAndUpdate(
//           { employeeId: existingAttendance.employeeId },
//           {
//             punchOutTime: todayTime,
//             locationPunchOut: {
//               type: "Point",
//               coordinates: [longitude, latitude],
//             },
//           },
//           { new: true }
//         )
//         .sort({ createdAt: -1 });

//       // console.log("-updatedAttendance", updatedAttendance);
//     } else {
//       return badRequest(res, "Invalid action use only 'in' or 'out' ");
//     }

//     const actionText = action === "in" ? "Punch in" : "Punch out";
//     success(res, `Employee ${actionText} successfully`, updatedAttendance);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

// IST is UTC+5:30 const istTime = new Date(now.getTime() + istOffset); // Format the IST date to desired format const year = istTime.getUTCFullYear(); const month = String(istTime.getUTCMonth() + 1).padStart(2, '0'); const day = String(istTime.getUTCDate()).padStart(2, '0'); const hours = String(istTime.getUTCHours()).padStart(2, '0'); const minutes = String(istTime.getUTCMinutes()).padStart(2, '0'); const seconds = String(istTime.getUTCSeconds()).padStart(2, '0'); const milliseconds = String(istTime.getUTCMilliseconds()).padStart(3, '0'); // Construct the formatted date-time string const formattedIST = ${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+05:30; return formattedIST; }

function getISTTimeFormatted() {
  const now = new Date();

  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);

  // Format the IST date to the desired format
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istTime.getUTCDate()).padStart(2, "0");
  const hours = String(istTime.getUTCHours()).padStart(2, "0");
  const minutes = String(istTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(istTime.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(istTime.getUTCMilliseconds()).padStart(3, "0");

  // Construct the formatted date-time string
  const formattedIST = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+05:30`;
  return formattedIST;
}

// async function employeePunch(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const employeeId = req.Id;
//     const { action } = req.query;
//     const { latitude, longitude } = req.query; // Get location coordinates from request body

//     console.log("longitude" ,   longitude)
//     console.log("latitude" ,  latitude)

//     if (!latitude || !longitude) {
//     return badRequest(res, "latitude and longitude Required");
//     }

//     let checkTime = moment().tz("Asia/Kolkata")

//     const now = new Date();

//     // Get IST time properly
//     const istTime = new Date(
//       now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//     );

//     // Format IST time in the desired format
//     const formattedIST = istTime.toISOString().replace('Z', '+05:30');

//     console.log("Formatted IST:", formattedIST);

//     // Get IST time properly
//     // const istTime = new Date(
//     //   now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
//     // );

//     // // Format IST time in the desired format
//     // const formattedIST = istTime.toISOString();
//     // console.log("Formatted IST:", formattedIST);

//     // const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

//     const todayStart = checkTime.clone().startOf("day").toDate();
//     // const todayStart = checkTime.clone().startOf("day").add(8, "hours").format("YYYY-MM-DD HH:mm:ss");
//     console.log("todayStart in IST:", todayStart);

//     const todayEnd = checkTime.clone().endOf("day").toDate();
//     console.log("todayEnd in IST:", todayEnd);

//     const todayTime = checkTime.format("YYYY-MM-DDThh:mm:ss A");
//     // console.log("todayTime----", todayTime);
//     const employeeExist = await employeeModel.findById(employeeId);
//     if (!employeeExist) {
//       badRequest(res, "employee not found");
//     }

//     const startOfDayLimit = new Date(todayStart);
//     startOfDayLimit.setHours(6, 0, 0, 0); // Set to 6 AM

//     // const existingAttendance = await attendanceModel.findOne({
//     //   employeeId,
//     //   date: { $gte: todayStart, $lte: todayEnd },
//     //   // createdAt: { $gte: startOfDayLimit, $lte: todayEnd },
//     // }).sort({ createdAt: -1 });

//     const existingAttendance = await attendanceModel.findOne({
//       employeeId,
//       date: { $gte: todayStart , $lte: todayEnd },
//     }).sort({ createdAt: -1 });

//     console.log("existingAttendance", existingAttendance);

//     let updatedAttendance;

//     const isWithinAllowedDistance = await workLocationModel.findOne({
//       location: {
//         $near: {
//           $maxDistance: 100,
//           $geometry: {
//             type: "Point",
//             coordinates: [latitude, longitude]
//           }
//         }
//       },
//       _id: employeeExist.workLocationId
//     })

//     if (action === "in") {

//       if (checkTime.isBefore(todayStart)) {
//         return badRequest(res, "You can only punch in after 8:00 AM.");
//       }

//       if (existingAttendance) {
//         return success(res, "Employee Already Punch In");
//       }
//       // Fetch work location
//       const workLocation = await workLocationModel.findById(
//         employeeExist.workLocationId
//       );
//       if (!workLocation) {
//         return badRequest(res, "Work location not found");
//       }

//       // const distance = haversineDistance(
//       //   [latitude, longitude],
//       //   [
//       //     workLocation.location.coordinates[1],
//       //     workLocation.location.coordinates[0],
//       //   ] // Note: [latitude, longitude]
//       // );
//       // // console.log(distance);

//       let punchInFrom;

//       // console.log('isWithinAllowedDistance', isWithinAllowedDistance)
//       if (isWithinAllowedDistance) {
//         punchInFrom = "branch";
//       } else{
//         return badRequest(res, "Punch-in failed: You are outside the work location.");
//         // punchInFrom = "outsideBranch";
//       }

//       // console.log('distance', distance)
//       // if (distance <= 100) {
//       //   punchInFrom = "branch";
//       // } else if (distance >= 100) {
//       //   punchInFrom = "outsideBranch";
//       // }
//       updatedAttendance = await attendanceModel.create({
//         employeeId: employeeId,
//         date: getISTTimeFormatted(),
//         approvalStatus: 'approved',
//         punchInTime: todayTime,
//         punchInFrom: punchInFrom,
//         locationPunchIn: {
//           type: "Point",
//           coordinates: [longitude, latitude],
//         },
//       });
//     } else if (action === "out") {
//       // console.log("existingAttendance-----", existingAttendance);
//       // console.log("todayTime-----", todayTime);

//       if (!existingAttendance) {
//         return badRequest(res, "Employee Not Punch In");
//       }

//       if (existingAttendance.punchOutTime) {
//         return success(res, "Employee Already Punch Out");
//       }

//       if (existingAttendance.punchInFrom !== "outsideBranch" && !isWithinAllowedDistance) {
//         return badRequest(res, "You are outside the work location.");
//       }

//       // console.log('-out check ',todayTime )

//       updatedAttendance = await attendanceModel
//         .findOneAndUpdate(
//           { employeeId: existingAttendance.employeeId },
//           {
//             punchOutTime: todayTime,
//             locationPunchOut: {
//               type: "Point",
//               coordinates: [longitude, latitude],
//             },
//           },
//           { new: true }
//         )
//         .sort({ createdAt: -1 });

//       // console.log("-updatedAttendance", updatedAttendance);
//     } else {
//       return badRequest(res, "Invalid action use only 'in' or 'out' ");
//     }

//     const actionText = action === "in" ? "Punch in" : "Punch out";
//     success(res, `Employee ${actionText} successfully`, updatedAttendance);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

// async function employeePunch(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const employeeId = req.Id;
//     const { action } = req.query;
//     const { latitude, longitude } = req.query; // Get location coordinates from request body

//     console.log('test funstio __1 ')
//     // if (!latitude || !longitude) {
//     // return badRequest(res, "Location coordinates (latitude and longitude) are required");
//     // }

//     let checkTime = moment().tz("Asia/Kolkata");

//     // const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

//     const todayStart = checkTime.clone().startOf("day").toDate(); // Start of the day in IST
//     const todayEnd = checkTime.clone().endOf("day").toDate();
//     const todayTime = checkTime.format("YYYY-MM-DDThh:mm:ss A");
//     // console.log("todayTime----", todayTime);
//     const employeeExist = await employeeModel.findById(employeeId);
//     if (!employeeExist) {
//       badRequest(res, "employee not found");
//     }

//     const startOfDayLimit = new Date(todayStart);
//     startOfDayLimit.setHours(6, 0, 0, 0); // Set to 6 AM

//     const existingAttendance = await attendanceModel.findOne({
//       employeeId,
//       date: { $gte: todayStart, $lte: todayEnd },
//       // createdAt: { $gte: startOfDayLimit, $lte: todayEnd },
//     }).sort({ createdAt: -1 });

//     let updatedAttendance;

//    const isWithinAllowedDistance = await workLocationModel.findOne({
//         location: {
//           $near: {
//             $maxDistance: 100,
//             $geometry: {
//               type: "Point",
//               coordinates: [latitude, longitude]
//             }
//           }
//         },
//         _id: employeeExist.workLocationId
//       })

//     if (action === "in") {
//       // console.log("existingAttendance---", existingAttendance);
//       // console.log("todayTime----", todayTime);
//       if (existingAttendance) {
//         return success(res, "Employee Already Punch In");
//       }
//       // Fetch work location
//       const workLocation = await workLocationModel.findById(
//         employeeExist.workLocationId
//       );
//       if (!workLocation) {
//         return badRequest(res, "Work location not found");
//       }

//       // const distance = haversineDistance(
//       //   [latitude, longitude],
//       //   [
//       //     workLocation.location.coordinates[1],
//       //     workLocation.location.coordinates[0],
//       //   ] // Note: [latitude, longitude]
//       // );
//       // // console.log(distance);

//       let punchInFrom;

//       console.log('isWithinAllowedDistance', isWithinAllowedDistance)
//       if (isWithinAllowedDistance) {
//         punchInFrom = "branch";
//       } else{
//         return badRequest(res, "You Are OutSide");
//         // punchInFrom = "outsideBranch";
//       }

//       // console.log('distance', distance)
//       // if (distance <= 100) {
//       //   punchInFrom = "branch";
//       // } else if (distance >= 100) {
//       //   punchInFrom = "outsideBranch";
//       // }
//       updatedAttendance = await attendanceModel.create({
//         employeeId: employeeId,
//         date: checkTime,
//         approvalStatus: 'approved',
//         punchInTime: todayTime,
//         punchInFrom: punchInFrom,
//         locationPunchIn: {
//           type: "Point",
//           coordinates: [longitude, latitude],
//         },
//       });
//     } else if (action === "out") {
//       // console.log("existingAttendance-----", existingAttendance);
//       // console.log("todayTime-----", todayTime);
//       if (!existingAttendance) {
//         return badRequest(res, "Employee Not Punch In");
//       }
//       if (existingAttendance.punchOutTime) {
//         return success(res, "Employee Already Punch Out");
//       }
//       // console.log('-out check ',todayTime )

//       updatedAttendance = await attendanceModel
//         .findOneAndUpdate(
//           { employeeId: existingAttendance.employeeId },
//           {
//             punchOutTime: todayTime,
//             locationPunchOut: {
//               type: "Point",
//               coordinates: [longitude, latitude],
//             },
//           },
//           { new: true }
//         )
//         .sort({ createdAt: -1 });

//       // console.log("-updatedAttendance", updatedAttendance);
//     } else {
//       return badRequest(res, "Invalid action use only 'in' or 'out' ");
//     }

//     const actionText = action === "in" ? "Punch in" : "Punch out";
//     success(res, `Employee ${actionText} successfully`, updatedAttendance);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

async function employeePunch(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const employeeId = req.Id;
    const { action } = req.query;
    const { latitude, longitude } = req.query; // Get location coordinates from request body

    console.log("latitude, longitude=---- ", latitude, longitude);
    if (!latitude || !longitude) {
      return badRequest(res, "latitude and longitude Required");
    }

    let checkTime = moment().tz("Asia/Kolkata");
    console.log("check htis funions", checkTime);

    // const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const todayStart = checkTime.clone().startOf("day").toDate(); // Start of the day in IST
    const todayEnd = checkTime.clone().endOf("day").toDate();
    const todayTime = checkTime.format("YYYY-MM-DDThh:mm:ss A");
    // console.log("todayTime----", todayTime);
    const employeeExist = await employeeModel.findById(employeeId);
    if (!employeeExist) {
      badRequest(res, "employee not found");
    }

    const startOfDayLimit = new Date(todayStart);
    startOfDayLimit.setHours(6, 0, 0, 0); // Set to 6 AM

    const existingAttendance = await attendanceModel
      .findOne({
        employeeId,
        date: { $gte: todayStart, $lte: todayEnd },
        // createdAt: { $gte: startOfDayLimit, $lte: todayEnd },
      })
      .sort({ createdAt: -1 });

    let updatedAttendance;

    const isWithinAllowedDistance = await workLocationModel.findOne({
      location: {
        $near: {
          $maxDistance: 100,
          $geometry: {
            type: "Point",
            coordinates: [latitude, longitude],
          },
        },
      },
      _id: employeeExist.workLocationId,
    });

    if (action === "in") {
      // console.log("existingAttendance---", existingAttendance);
      // console.log("todayTime----", todayTime);
      if (existingAttendance) {
        return success(res, "Employee Already Punch In");
      }

      // Fetch work location
      const workLocation = await workLocationModel.findById(
        employeeExist.workLocationId
      );
      if (!workLocation) {
        return badRequest(res, "Work location not found");
      }

      // const distance = haversineDistance(
      //   [latitude, longitude],
      //   [
      //     workLocation.location.coordinates[1],
      //     workLocation.location.coordinates[0],
      //   ] // Note: [latitude, longitude]
      // );
      // // console.log(distance);

      let punchInFrom;

      // console.log('isWithinAllowedDistance', isWithinAllowedDistance)
      if (isWithinAllowedDistance) {
        punchInFrom = "branch";
      } else {
        return badRequest(res, "You Are OutSide");
        // punchInFrom = "outsideBranch";
      }

      // console.log('distance', distance)
      // if (distance <= 100) {
      //   punchInFrom = "branch";
      // } else if (distance >= 100) {
      //   punchInFrom = "outsideBranch";
      // }
      updatedAttendance = await attendanceModel.create({
        employeeId: employeeId,
        date: checkTime,
        approvalStatus: "approved",
        punchInTime: todayTime,
        punchInFrom: punchInFrom,
        locationPunchIn: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      });
    } else if (action === "out") {
      // console.log("todayTime-----", todayTime);

      if (!existingAttendance) {
        return badRequest(res, "Employee Not Punch In");
      }

      if (
        existingAttendance.punchInFrom !== "outsideBranch" &&
        !isWithinAllowedDistance
      ) {
        return badRequest(res, "You are outside the work location.");
      }

      if (existingAttendance.punchOutTime) {
        return success(res, "Employee Already Punch Out");
      }

      // console.log('-out check ',todayTime )

      updatedAttendance = await attendanceModel
        .findOneAndUpdate(
          { employeeId: existingAttendance.employeeId },
          {
            punchOutTime: todayTime,
            locationPunchOut: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
          { new: true }
        )
        .sort({ createdAt: -1 });

      // console.log("-updatedAttendance", updatedAttendance);
    } else {
      return badRequest(res, "Invalid action use only 'in' or 'out' ");
    }

    const actionText = action === "in" ? "Punch in" : "Punch out";
    success(res, `Employee ${actionText} successfully`, updatedAttendance);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function changeToOutside(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const employeeId = req.Id;
    let todaysDate = moment().tz("Asia/Kolkata");

    const todayStart = todaysDate.clone().startOf("day").toDate(); // Start of the day in IST
    const todayEnd = todaysDate.clone().endOf("day").toDate();
    const todayTime = todaysDate.format("YYYY-MM-DDThh:mm:ss A");

    const startOfDayLimit = new Date(todayStart);
    startOfDayLimit.setHours(6, 0, 0, 0); // Set to 6 AM

    const existingAttendance = await attendanceModel
      .findOne({
        employeeId,
        date: { $gte: todayStart, $lte: todayEnd },
        // createdAt: { $gte: startOfDayLimit, $lte: todayEnd },
      })
      
    if (!existingAttendance || existingAttendance?.punchInFrom == "outsideBranch") {
      if (!existingAttendance) {
      return badRequest(res, `You Are Not In Working Hours`);
      }
      return badRequest(res, `You Have Already Punched From Outside`);
    }

    const existingRequest = await attendanceChangeModel
    .findOne({
      employeeId,
      date: { $gte: todayStart, $lte: todayEnd },
      // createdAt: { $gte: startOfDayLimit, $lte: todayEnd },
    })
  if (existingRequest) {
    return badRequest(res, `You Have Already Raised A Request`);
  }

    const saveData = new attendanceChangeModel({
      employeeId,
      date: todaysDate,
    })
    await saveData.save();
    return success(res, `Employee Attendance successfully Updated`);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function approveChangeAttendace(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const {id,status} = req.body;
    let todaysDate = moment().tz("Asia/Kolkata");

    const todayStart = todaysDate.clone().startOf("day").toDate(); // Start of the day in IST
    const todayEnd = todaysDate.clone().endOf("day").toDate();
    const todayTime = todaysDate.format("YYYY-MM-DDThh:mm:ss A");

    const startOfDayLimit = new Date(todayStart);
    startOfDayLimit.setHours(6, 0, 0, 0); // Set to 6 AM

    const saveData = await attendanceChangeModel.findOneAndUpdate({
      _id:id,
    },{
      approvalStatus:status
    })
    if(status == "approved"){
      await changePunchInType(saveData.employeeId);
    }
    return success(res, `Employee Attendance successfully Updated`);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getChangeAttendanceList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const today = new Date();
    const startOfToday = new Date(today);
    const status = req.query.status

    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
let query = { date: 
  { 
    $gt: startOfToday, 
    $lt: endOfToday 
  },}
if (status) {
  query = {...query,approvalStatus:status}
}
    const changeList = await attendanceChangeModel.find(query).populate("employeeId","employeName mobileNo employeePhoto employeUniqueId")

    return success(res, `Attendance Change List`,changeList);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}



//----------------------------------------------------------------------------------------------------------

async function employeePunchOutSideBranch(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const employeeId = req.Id;
    const { remark } = req.body;

    let checkTime = moment().tz("Asia/Kolkata");
    console.log("check htis funions");
    // const startDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DDThh:mm:ss A");

    const todayStart = checkTime.clone().startOf("day").toDate(); // Start of the day in IST
    const todayEnd = checkTime.clone().endOf("day").toDate();
    const todayTime = checkTime.format("YYYY-MM-DDThh:mm:ss A");
    // console.log("todayTime----", todayTime);
    const employeeExist = await employeeModel.findById(employeeId);
    if (!employeeExist) {
      badRequest(res, "employee not found");
    }

    // Lookup employment type
    const employmentData = await employeeModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(employeeId) },
      },
      {
        $lookup: {
          from: "employmenttypes",
          localField: "employementTypeId",
          foreignField: "_id",
          as: "employmentTypeDetails",
        },
      },
      {
        $unwind: {
          path: "$employmentTypeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          employmentTypeTitle: "$employmentTypeDetails.title",
        },
      },
    ]);
    const employmentTypeTitle = employmentData?.[0]?.employmentTypeTitle;

    const approvalStatus = employmentTypeTitle == "field" ? "approved" : "new";

    const startOfDayLimit = new Date(todayStart);
    startOfDayLimit.setHours(6, 0, 0, 0); // Set to 6 AM

    const existingAttendance = await attendanceModel.findOne({
      employeeId,
      date: { $gte: todayStart, $lte: todayEnd },
      createdAt: { $gte: startOfDayLimit, $lte: todayEnd },
    });

    let updatedAttendance;

    // console.log("existingAttendance---", existingAttendance);
    // console.log("todayTime----", todayTime);
    if (existingAttendance) {
      return success(res, "Employee Already Punch In");
    }
    updatedAttendance = await attendanceModel.create({
      employeeId: employeeId,
      date: checkTime,
      punchInTime: todayTime,
      punchInFrom: "outsideBranch",
      remark: remark,
      approvalStatus: approvalStatus,
    });

    success(
      res,
      `Employee punch in successfully waiting for approval `,
      updatedAttendance
    );
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

//-------------------------------------------------------------------------------------------------

async function employeePunchApproval(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const reportingManagerId = req.Id;

    const { action, attendanceId } = req.body;
    // console.log(attendanceId);
    if (!attendanceId || attendanceId.trim() === "") {
      return badRequest(res, "Attendance Id is required and cannot be empty");
    }
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return badRequest(res, "Invalid Attendance Id");
    }
    // Validate the mode
    const validActions = ["approved", "notApproved"];
    if (!validActions.includes(action)) {
      return badRequest(
        res,
        "Invalid action. action must be 'approved' or 'notApproved'"
      );
    }
    const existingAttendance = await attendanceModel.findById(attendanceId);
    // console.log(existingAttendance);
    let updatedAttendance;

    // console.log("existingAttendance---", existingAttendance);
    if (!existingAttendance) {
      return success(res, "Employee Attendance Not Found");
    }
    updatedAttendance = await attendanceModel.findOneAndUpdate(
      { _id: attendanceId },
      { approvalStatus: action },
      { new: true }
    );

    success(res, `Employee punch in ${action} `, updatedAttendance);
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}
//--------------------------------------------------------------------------------
async function getemployeePunchApproval(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const reportingManagerId = req.Id;
    // console.log(reportingManagerId);

    const attendance = await attendanceModel.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeData",
        },
      },
      { $unwind: "$employeeData" },
      {
        $match: {
          "employeeData.reportingManagerId": new mongoose.Types.ObjectId(
            reportingManagerId
          ),
          approvalStatus: "new",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    if (attendance.length === 0) {
      return success(res, "No attendance records found for approval", []);
    }

    success(res, "Attendance records found for approval", attendance);
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

async function getemployeePunchApprovalHR(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { startDate, endDate, status } = req.query;

    let start, end;

    if (!startDate || !endDate) {
      const today = new Date();
      start = new Date(today);
      start.setUTCHours(0, 0, 0, 0); // Today 00:00:00 UTC

      end = new Date(today);
      end.setUTCHours(23, 59, 59, 999); // Today 23:59:59 UTC
    } else {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);

      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    }

    // console.log(reportingManagerId);

    const attendance = await attendanceModel.aggregate([
      {
        $lookup: {
          from: "employees", // Ensure the collection name is correct
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeData",
        },
      },
      { $unwind: "$employeeData" },

      {
        $lookup: {
          from: "newbranches", // Ensure this matches the correct collection name
          localField: "employeeData.branchId", // Assuming branchId is an ObjectId already
          foreignField: "_id",
          as: "branchData",
        },
      },
      { $unwind: { path: "$branchData", preserveNullAndEmptyArrays: true } },

      // Join designation data from employeeData.designationId
      {
        $lookup: {
          from: "newdesignations", // Confirm the collection name
          localField: "employeeData.designationId",
          foreignField: "_id",
          as: "designationData",
        },
      },
      {
        $unwind: { path: "$designationData", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "employeeData.departmentId",
          foreignField: "_id",
          as: "departmentdata",
        },
      },
      {
        $unwind: { path: "$departmentdata", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          departmentName: "$departmentdata.name",
        },
      },
      {
        $unset: "departmentdata",
      },

      {
        $lookup: {
          from: "newworklocations",
          localField: "employeeData.workLocationId",
          foreignField: "_id",
          as: "workLocationdata",
        },
      },
      {
        $unwind: {
          path: "$workLocationdata",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          locationCity: "$workLocationdata.name",
        },
      },
      {
        $unset: "workLocationdata",
      },

      {
        $lookup: {
          from: "employees", // Collection name (this is "employees", not "employee")
          localField: "employeeData.reportingManagerId",
          foreignField: "_id",
          as: "Reportingdata",
        },
      },
      {
        $unwind: { path: "$Reportingdata", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          ReportingManagerName: "$Reportingdata.employeName",
        },
      },
      {
        $unset: "Reportingdata",
      },

      {
        $match: {
          approvalStatus: status || "new",
          date: { $gte: start, $lte: end },
          ...(status == "approved" && { punchInFrom: "outsideBranch" }),
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    if (attendance.length === 0) {
      return success(res, "No attendance records found for approval", []);
    }

    success(res, "Attendance records found for approval", attendance);
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

// --------------------------------- multiple Time Punch IN AND Punch Out Ond Day -------------------------------------//

async function employeePunchList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const employeeId = req.Id;
    const { startDate, endDate } = req.query;
    const employee = await employeeModel.findOne({ _id: employeeId });
    if (!employee) {
      return badRequest(res, "Employee Not Found");
    }
    let employeeList;
    if (startDate && endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputEndDate = new Date(endDate);
      if (inputEndDate > today) {
        return badRequest(res, "Check Data Only Before Current Date");
      }
      employeeList = await attendanceModel.find({
        employeeId,
        date: { $gte: startDate, $lte: endDate },
      });
    } else {
      employeeList = await attendanceModel.find({ employeeId });
    }
    if (!employeeList.length > 0) {
      return badRequest(res, "Employee Data Not Found");
    }
    success(res, "Employee Punch List", {
      count: employeeList.length,
      list: employeeList,
    });
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

async function deleteAttendance(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const employeeId = req.Id;
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    let employeeData = await attendanceModel.findOneAndDelete({
      employeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    success(res, "Employee Data", employeeData);
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

async function punchDetail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const employeeId = req.Id;
    const { _id } = req.query;
    if (_id == undefined || !_id) {
      return badRequest(res, "Form ID is required");
    }
    const employee = await employeeModel.findOne({ _id: employeeId });
    if (!employee) {
      return badRequest(res, "Employee Not Found");
    }
    const punchDteail = await attendanceModel.findById(_id);
    if (!punchDteail) {
      return badRequest(res, "Not Found");
    }
    success(res, "Punch Detail", punchDteail);
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

// Helper function to get the start and end dates of a given month and year
// function getMonthDateRange(month, year = new Date().getFullYear()) {
//   const startDate = new Date(year, month - 1, 1);
//   const endDate = new Date(year, month, 0);
//   endDate.setHours(23, 59, 59, 999);
//   return { startDate, endDate };
// }

//-------------------------------------------------
// working properly //
async function getEmployeeMonthlyAttendance(req, res) {
  try {
    const { employeeId, month, year } = req.query;

    if (!employeeId) {
      return badRequest(res, "Please provide employeeId");
    }
    // console.log("-------------------->", employeeId);
    const employeeDetail = await employeeModel
      .findById(employeeId)
      .select("-password")
      .populate("branchId", "name  punchInTime punchOutTime")
      .populate("roleId", "roleName")
      .populate("reportingManagerId", "employeUniqueId employeName userName")
      .populate("departmentId", "name")
      .populate("subDepartmentId", "name")
      .populate("secondaryDepartmentId", "name")
      .populate("seconSubDepartmentId", "name")
      .populate("designationId", "name")
      .populate("workLocationId", "name")
      .populate("constCenterId", "title")
      .populate("employementTypeId", "title")
      .populate("employeeTypeId", "title")
      .sort({ createdAt: -1 });

    if (!employeeDetail || !employeeDetail.branchId) {
      throw new Error("Branch details not found for the employee.");
    }

    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentDate = new Date();

    const { startDate, endDate } = getMonthDateRange(
      selectedMonth,
      selectedYear
    );
    console.log("startDate", startDate);
    console.log(endDate);
    // Limit `endDate` to today if the selected month is the current month
    const effectiveEndDate =
      selectedYear === currentDate.getFullYear() &&
      selectedMonth === currentDate.getMonth() + 1
        ? currentDate
        : endDate;

    const attendanceRecords = await attendanceModel.find({
      employeeId: new ObjectId(employeeId),
      date: { $gte: startDate, $lte: effectiveEndDate },
      approvalStatus: "approved",
    });

    let presentCount = 0;
    let totalPresentCount = 0;
    let sundayPresentCount = 0;
    let halfDayTotalCount = 0;
    let halfDayLatePunchInCount = 0;
    let halfDayEarlyPunchOutCount = 0;
    let lateComingCount = 0;
    let earlyGoingCount = 0;
    let noPunchIn = 0;
    let noPunchOut = 0;
    let totalDeduction = 0;
    let finalPresent = 0;
    let paidLeave = 0;
    let appliedLeaves = 0;
    // Count days the employee has punched in
    // attendanceRecords.forEach((record) => {
    //   if (record.punchInTime) {
    //     presentCount++;
    //   }

    // });
    attendanceRecords.forEach((record) => {
      if (record.punchInTime) {
        const recordPunchInTime = moment(
          record.punchInTime,
          "YYYY-MM-DDTHH:mm:ss A"
        );

        const branchRawPunchInTime = moment(
          employeeDetail.branchId.punchInTime,
          "YYYY-MM-DDTHH:mm:ss A"
        ).format("HH:mm:ss"); // Extract branch punch-in time (HH:mm:ss)

        const branchPunchInTime = moment(
          `${recordPunchInTime.format("YYYY-MM-DD")}T${branchRawPunchInTime}`,
          "YYYY-MM-DDTHH:mm:ss"
        ); // Combine record punch-in date with branch punch-in time

        const diffMinutes = recordPunchInTime.diff(
          branchPunchInTime,
          "minutes"
        );
        // console.log("recordPunchInTime",recordPunchInTime);
        // console.log("branchPunchInTime",branchPunchInTime);
        // console.log("diffMinutes",diffMinutes);
        if (diffMinutes <= 15) {
          // Within branch punch-in time + 15 minutes
          presentCount += 1;
        } else if (diffMinutes > 15 && diffMinutes <= 45) {
          // Between branch punch-in time + 15 and +30 minutes
          // console.log(diffMinutes);
          presentCount += 1;
          lateComingCount += 1;
        } else if (diffMinutes > 45) {
          // Beyond branch punch-in time + 45 minutes
          const fourHourCutoff = branchPunchInTime.clone().add(4, "hours");

          if (recordPunchInTime.isAfter(fourHourCutoff)) {
            // Punched in after 4 hours from branch punch-in time
            noPunchIn += 1; // Mark as no punch-in or take other action
          } else {
            presentCount += 1;
            halfDayLatePunchInCount += 0.5;
            halfDayTotalCount += 0.5;
          }
        }
      } else {
        noPunchIn += 1;
      }

      if (record.punchOutTime) {
        const punchOutDate = moment(
          record.punchOutTime,
          "YYYY-MM-DDTHH:mm:ss A"
        ); // Parse punch-out time

        const branchRawPunchOutTime = moment(
          employeeDetail.branchId.punchOutTime,
          "YYYY-MM-DDTHH:mm:ss A"
        ).format("HH:mm:ss"); // Extract branch punch-out time (HH:mm:ss)

        const branchPunchOutTime = moment(
          `${punchOutDate.format("YYYY-MM-DD")}T${branchRawPunchOutTime}`,
          "YYYY-MM-DDTHH:mm:ss"
        ); // Combine record punch-out date with branch punch-out time

        // Calculate difference in minutes
        const diffMinutes = punchOutDate.diff(branchPunchOutTime, "minutes");

        // Logic for punch-out before 1 hour from branch punch-out timing: Half day
        if (diffMinutes < -60) {
          halfDayEarlyPunchOutCount += 0.5;
          halfDayTotalCount += 0.5; // Add to total half-day count
        }
        // Logic for punch-out within 1 hour before branch punch-out timing to branch punch-out time: Early leaving
        else if (diffMinutes >= -60 && diffMinutes <= 0) {
          earlyGoingCount += 1; // Add to early leaving count
        }
      } else {
        noPunchOut += 1; // No punch-out recorded
      }
    });

    const sundaysInMonth = getSundaysInMonth(
      selectedMonth,
      selectedYear
    ).filter((sunday) => sunday <= effectiveEndDate);

    const sundayDates = sundaysInMonth.map(
      (sunday) => sunday.toISOString().split("T")[0]
    );

    const presentDates = attendanceRecords.map(
      (record) => record.date.toISOString().split("T")[0]
    );

    sundayPresentCount = sundayDates.filter(
      (sunday) => !presentDates.includes(sunday)
    ).length;

    // Add Sundays to present count
    totalPresentCount = presentCount + sundayPresentCount;

    const daysToConsider =
      selectedYear === currentDate.getFullYear() &&
      selectedMonth === currentDate.getMonth() + 1
        ? currentDate.getDate()
        : new Date(selectedYear, selectedMonth, 0).getDate();

    const absentCount = daysToConsider - totalPresentCount;
    const policyData = await policyModel
      .findOne({})
      .sort({ createdAt: 1 })
      .exec();

    let halfDay = 0;
    const defaultLateComingAllowed = 3;
    const defaultEarlyGoingAllowed = 3;

    const lateComingAllowed = policyData
      ? policyData.lateComingAllowed
      : defaultLateComingAllowed;
    const earlyGoingAllowed = policyData
      ? policyData.earlyGoingAllowed
      : defaultEarlyGoingAllowed;

    if (lateComingCount > lateComingAllowed) {
      halfDay += lateComingCount - lateComingAllowed;
    }
    if (earlyGoingCount > earlyGoingAllowed) {
      halfDay += earlyGoingCount - earlyGoingAllowed;
    }

    totalDeduction = halfDayTotalCount + halfDay / 2;
    finalPresent = totalPresentCount - totalDeduction;

    // Create a set of all dates between startDate and endDate
    const allDatesInRange = getAllDatesInRange(startDate, endDate);

    // Map attendanceRecords to a date-based dictionary for fast lookup
    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      const formattedDate = moment(record.date).format("YYYY-MM-DD");
      attendanceMap[formattedDate] = record;
    });

    // Final attendance array including missing dates with null punchInTime/punchOutTime
    // const fullAttendanceRecords = allDatesInRange.map((date) => {
    //   const formattedDate = moment(date).format("YYYY-MM-DD");

    //   // If attendance exists for the date, include it; otherwise, return a placeholder
    //   if (attendanceMap[formattedDate]) {
    //     const punchIn = attendanceMap[formattedDate].punchInTime
    //       ? moment(
    //           attendanceMap[formattedDate].punchInTime,
    //           "YYYY-MM-DDTHH:mm:ss A"
    //         )
    //       : null;
    //     const punchOut = attendanceMap[formattedDate].punchOutTime
    //       ? moment(
    //           attendanceMap[formattedDate].punchOutTime,
    //           "YYYY-MM-DDTHH:mm:ss A"
    //         )
    //       : moment(punchIn).hour(15).minute(0).second(0); // Default to 3:00 PM

    //     if (punchIn && punchOut && punchOut.isValid() && punchIn.isValid()) {
    //       if (punchOut.isAfter(punchIn)) {
    //         const duration = moment.duration(punchOut.diff(punchIn));
    //         const hours = Math.floor(duration.asHours()); // Get total hours
    //         const minutes = Math.floor(duration.asMinutes() % 60); // Get remaining minutes
    //         attendanceMap[formattedDate].workedHour = `${hours}h ${minutes}m`; // Format worked hours
    //       }
    //     }
    //     // console.log(attendanceMap[formattedDate].workedHour)

    //     return attendanceMap[formattedDate];
    //   } else {
    //     const leaveApplied =  employeeLeaveModel.find({
    //       employeeId: new ObjectId(employeeId),
    //       approvalByReportingManager: "yes",
    //     })
    //     return {
    //       employeeId: employeeId,
    //       date: date,
    //       punchInTime: "A",
    //       punchOutTime: "A",
    //       workedHour: "",
    //       locationPunchIn: { type: "Point", coordinates: [] },
    //       locationPunchOut: { type: "Point", coordinates: [] },
    //       remark: "",
    //       approvalStatus: "pending",
    //     };
    //   }
    // });
    const fullAttendanceRecords = await Promise.all(
      allDatesInRange.map(async (date) => {
        // const currentFormattedDate = moment
        //   .tz(`${date} 00:00:00`, "Asia/Kolkata") // Append time and parse in Asia/Kolkata timezone
        //   .startOf("day") // Ensure the time is set to the start of the day
        //   .toDate(); // Convert to a JavaScript Date object
        const currentFormattedDate = date;

        const formattedDate = moment(currentFormattedDate).format("YYYY-MM-DD");

        // Check if the date has attendance or needs to consider leave
        if (attendanceMap[formattedDate]) {
          const punchIn = attendanceMap[formattedDate].punchInTime
            ? moment(
                attendanceMap[formattedDate].punchInTime,
                "YYYY-MM-DDTHH:mm:ss A"
              )
            : null;
          const punchOut = attendanceMap[formattedDate].punchOutTime
            ? moment(
                attendanceMap[formattedDate].punchOutTime,
                "YYYY-MM-DDTHH:mm:ss A"
              )
            : punchIn
            ? moment(punchIn).hour(15).minute(0).second(0) // Default to 3:00 PM if punchOut is empty
            : null;

          if (punchIn && punchOut && punchOut.isValid() && punchIn.isValid()) {
            if (punchOut.isAfter(punchIn)) {
              const duration = moment.duration(punchOut.diff(punchIn));
              const hours = Math.floor(duration.asHours()); // Get total hours
              const minutes = Math.floor(duration.asMinutes() % 60); // Get remaining minutes
              attendanceMap[formattedDate].workedHour = `${hours}h ${minutes}m`; // Format worked hours
              attendanceMap[formattedDate].attendance = "p"; // Format worked hours
            }
          }
          return attendanceMap[formattedDate];
        } else {
          // Check for leave applied for this date
          // console.log("attendanceMap[formattedDate]",attendanceMap[formattedDate]);
          // console.log("currentFormattedDate",currentFormattedDate);
          const leaveApplied = await employeeLeaveModel.findOne({
            employeeId: new ObjectId(employeeId),
            approvalByReportingManager: "yes",
            startDate: { $lte: currentFormattedDate }, // Start date should be before or on the current date
            endDate: { $gte: currentFormattedDate }, // End date should be after or on the current date
          });

          if (leaveApplied) {
            const leaveStart = moment(leaveApplied.startDate).startOf("day");
            const leaveEnd = moment(leaveApplied.endDate).startOf("day");
            const leaveDuration = leaveEnd.diff(leaveStart, "days") + 1; // +1 to include the start date
            console.log(leaveDuration);
            const leaveAllowed = policyData ? policyData.LeaveAllowed : 1;

            if (leaveDuration >= leaveAllowed) {
              paidLeave = leaveAllowed;
              appliedLeaves = leaveDuration;
            }
            return {
              employeeId: employeeId,
              date: currentFormattedDate,
              punchInTime: moment(leaveApplied.startDate).isSame(
                currentFormattedDate,
                "day"
              )
                ? null
                : null, // "PL" for the first date
              punchOutTime: moment(leaveApplied.startDate).isSame(
                currentFormattedDate,
                "day"
              )
                ? null
                : null,
              workedHour: "",
              attendance: moment(leaveApplied.startDate).isSame(
                currentFormattedDate,
                "day"
              )
                ? "PL"
                : "A",
              locationPunchIn: { type: "Point", coordinates: [] },
              locationPunchOut: { type: "Point", coordinates: [] },
              remark: leaveApplied.remark || "Leave Applied",
              approvalStatus: leaveApplied.approvalByReportingManager,
            };
          }

          // Default placeholder if no attendance or leave
          return {
            employeeId: employeeId,
            date: currentFormattedDate,
            punchInTime: null,
            punchOutTime: null,
            workedHour: "",
            attendance: "A",
            locationPunchIn: { type: "Point", coordinates: [] },
            locationPunchOut: { type: "Point", coordinates: [] },
            remark: "",
            approvalStatus: "pending",
          };
        }
      })
    );

    return success(res, "Employee Attendance List", {
      year: selectedYear,
      month: selectedMonth,
      monthDays: daysToConsider,
      absentDays: absentCount,
      presentDays: totalPresentCount, // Total present days including Sundays
      punchCount: presentCount, // Total present days including Sundays
      sundayPresentCount: sundayPresentCount, // Only Sundays counted as present
      halfDayTotalCount: halfDayTotalCount,
      halfDayLatePunchInCount: halfDayLatePunchInCount,
      halfDayEarlyPunchOutCount: halfDayEarlyPunchOutCount,
      lateComingCount: lateComingCount,
      earlyGoingCount: earlyGoingCount,
      noPunchIn: noPunchIn,
      noPunchOut: noPunchOut,
      totalDeduction: totalDeduction,
      paidLeave: paidLeave,
      appliedLeaves: appliedLeaves,
      finalPresent: finalPresent + paidLeave,
      employeeDetail: employeeDetail,
      attendanceRecords: attendanceRecords,
      fullAttendanceRecords: fullAttendanceRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    unknownError(res, error);
  }
}

// working code //
// async function newMonthlyAttendance(req, res) {
//   try {
//     const { employeeId, month, year } = req.query;

//     if (!employeeId) {
//       return badRequest(res, "Please provide employeeId");
//     }

//     const employeeDetail = await employeeModel
//       .findById(employeeId)
//       .select("-password")
//       .populate("branchId", "name punchInTime punchOutTime")
//       .populate("roleId", "roleName")
//       .populate("reportingManagerId", "employeUniqueId employeName userName")
//       .populate("departmentId", "name")
//       .populate("subDepartmentId", "name")
//       .populate("secondaryDepartmentId", "name")
//       .populate("seconSubDepartmentId", "name")
//       .populate("designationId", "name")
//       .populate("workLocationId", "name")
//       .populate("constCenterId", "title")
//       .populate("employementTypeId", "title")
//       .populate("employeeTypeId", "title")
//       .sort({ createdAt: -1 });

//     if (!employeeDetail || !employeeDetail.branchId) {
//       throw new Error("Branch details not found for the employee.");
//     }

//     const selectedYear = year ? parseInt(year) : new Date().getFullYear();
//     const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
//     const currentDate = new Date();

//     const { startDate, endDate } = getMonthDateRange(
//       selectedMonth,
//       selectedYear
//     );
//     console.log("startDate", startDate);
//     console.log("endDate", endDate);

//     // Limit `endDate` to today if the selected month is the current month
//     const effectiveEndDate =
//       selectedYear === currentDate.getFullYear() &&
//         selectedMonth === currentDate.getMonth() + 1
//         ? currentDate
//         : endDate;

//         const attendanceRecords = await attendanceModel.find({
//           employeeId: new ObjectId(employeeId),
//           date: { $gte: startDate, $lte: effectiveEndDate },
//           approvalStatus: "approved",
//         });

//     let presentCount = 0;
//     let totalPresentCount = 0;
//     let sundayPresentCount = 0;
//     let halfDayTotalCount = 0;
//     let halfDayLatePunchInCount = 0;
//     let halfDayEarlyPunchOutCount = 0;
//     let lateComingCount = 0;
//     let earlyGoingCount = 0;
//     let noPunchIn = 0;
//     let noPunchOut = 0;
//     let totalDeduction = 0;
//     let finalPresent = 0;
//     let paidLeave = 0;
//     let appliedLeaves = 0;

//     attendanceRecords.forEach((record) => {
//       if (record.punchInTime) {
//         const recordPunchInTime = moment(
//           record.punchInTime,
//           "YYYY-MM-DDTHH:mm:ss A"
//         );

//         const branchRawPunchInTime = moment(
//           employeeDetail.branchId.punchInTime,
//           "YYYY-MM-DDTHH:mm:ss A"
//         ).format("HH:mm:ss"); // Extract branch punch-in time (HH:mm:ss)

//         const branchPunchInTime = moment(
//           `${recordPunchInTime.format("YYYY-MM-DD")}T${branchRawPunchInTime}`,
//           "YYYY-MM-DDTHH:mm:ss"
//         ); // Combine record punch-in date with branch punch-in time

//         const diffMinutes = recordPunchInTime.diff(
//           branchPunchInTime,
//           "minutes"
//         );
//         // console.log("recordPunchInTime",recordPunchInTime);
//         // console.log("branchPunchInTime",branchPunchInTime);
//         // console.log("diffMinutes",diffMinutes);
//         if (diffMinutes <= 15) {
//           // Within branch punch-in time + 15 minutes
//           presentCount += 1;
//         } else if (diffMinutes > 15 && diffMinutes <= 45) {
//           // Between branch punch-in time + 15 and +30 minutes
//           // console.log(diffMinutes);
//           presentCount += 1;
//           lateComingCount += 1;
//         } else if (diffMinutes > 45) {
//           // Beyond branch punch-in time + 45 minutes
//           const fourHourCutoff = branchPunchInTime.clone().add(4, "hours");

//           if (recordPunchInTime.isAfter(fourHourCutoff)) {
//             // Punched in after 4 hours from branch punch-in time
//             noPunchIn += 1; // Mark as no punch-in or take other action
//           } else {
//             presentCount += 1;
//             halfDayLatePunchInCount += 0.5;
//             halfDayTotalCount += 0.5;
//           }
//         }
//       } else {
//         noPunchIn += 1;
//       }

//       if (record.punchOutTime) {
//         const punchOutDate = moment(
//           record.punchOutTime,
//           "YYYY-MM-DDTHH:mm:ss A"
//         ); // Parse punch-out time

//         const branchRawPunchOutTime = moment(
//           employeeDetail.branchId.punchOutTime,
//           "YYYY-MM-DDTHH:mm:ss A"
//         ).format("HH:mm:ss"); // Extract branch punch-out time (HH:mm:ss)

//         const branchPunchOutTime = moment(
//           `${punchOutDate.format("YYYY-MM-DD")}T${branchRawPunchOutTime}`,
//           "YYYY-MM-DDTHH:mm:ss"
//         ); // Combine record punch-out date with branch punch-out time

//         // Calculate difference in minutes
//         const diffMinutes = punchOutDate.diff(branchPunchOutTime, "minutes");

//         // Logic for punch-out before 1 hour from branch punch-out timing: Half day
//         if (diffMinutes < -60) {
//           halfDayEarlyPunchOutCount += 0.5;
//           halfDayTotalCount += 0.5; // Add to total half-day count
//         }
//         // Logic for punch-out within 1 hour before branch punch-out timing to branch punch-out time: Early leaving
//         else if (diffMinutes >= -60 && diffMinutes <= 0) {
//           earlyGoingCount += 1; // Add to early leaving count
//         }
//       } else {
//         noPunchOut += 1; // No punch-out recorded
//       }
//     });

//     const sundaysInMonth = getSundaysInMonth(
//       selectedMonth,
//       selectedYear
//     ).filter((sunday) => sunday <= effectiveEndDate);

//     const sundayDates = sundaysInMonth.map(
//       (sunday) => sunday.toISOString().split("T")[0]
//     );

//     const presentDates = attendanceRecords.map(
//       (record) => record.date.toISOString().split("T")[0]
//     );

//     sundayPresentCount = sundayDates.filter(
//       (sunday) => !presentDates.includes(sunday)
//     ).length;

//     // Add Sundays to present count
//     totalPresentCount = presentCount + sundayPresentCount;

//     const daysToConsider =
//       selectedYear === currentDate.getFullYear() &&
//         selectedMonth === currentDate.getMonth() + 1
//         ? currentDate.getDate()
//         : new Date(selectedYear, selectedMonth, 0).getDate();

//     const absentCount = daysToConsider - totalPresentCount;

//     const policyData = await policyModel
//       .findOne({})
//       .sort({ createdAt: 1 })
//       .exec();

//     let halfDay = 0;
//     const defaultLateComingAllowed = 3;
//     const defaultEarlyGoingAllowed = 3;

//     const lateComingAllowed = policyData
//       ? policyData.lateComingAllowed
//       : defaultLateComingAllowed;
//     const earlyGoingAllowed = policyData
//       ? policyData.earlyGoingAllowed
//       : defaultEarlyGoingAllowed;

//     if (lateComingCount > lateComingAllowed) {
//       halfDay += lateComingCount - lateComingAllowed;
//     }
//     if (earlyGoingCount > earlyGoingAllowed) {
//       halfDay += earlyGoingCount - earlyGoingAllowed;
//     }

//     totalDeduction = halfDayTotalCount + halfDay / 2;
//     finalPresent = totalPresentCount - totalDeduction;

//     // Create a set of all dates between startDate and endDate
//     const allDatesInRange = getAllDatesInRange(startDate, effectiveEndDate);

//     const attendanceMap = {};
//     attendanceRecords.forEach((record) => {
//       const formattedDate = moment(record.date).format("YYYY-MM-DD");
//       attendanceMap[formattedDate] = record;
//     });

//     // working with puchIn and punchOut time
//     // const items = await Promise.all(
//     //   allDatesInRange.map(async (date) => {
//     //     const formattedDate = moment(date).format("YYYY-MM-DD");

//     //     // Determine the day of the week (e.g., "Monday", "Tuesday", etc.)
//     //     const dayOfWeek = moment(formattedDate).format("dddd");

//     //     if (attendanceMap[formattedDate]) {
//     //       const punchIn = attendanceMap[formattedDate].punchInTime
//     //         ? moment(attendanceMap[formattedDate].punchInTime, "YYYY-MM-DDTHH:mm:ss A")
//     //         : null;
//     //         const punchOut = attendanceMap[formattedDate].punchOutTime
//     //         ? moment(attendanceMap[formattedDate].punchOutTime, "YYYY-MM-DDTHH:mm:ss A")
//     //         : "";  // Set to empty string if punchOutTime is not available

//     //       // Determine attendance status and worked hours
//     //       let attendanceStatus = "A"; // Default to Absent
//     //       let workedHour = "0h 0m"; // Default worked hours
//     //       let approvalStatus = attendanceMap[formattedDate].approvalStatus || "Absent"; // Get approval status from attendanceMap

//     //       if (punchIn && punchOut && punchOut.isValid() && punchIn.isValid()) {
//     //         if (punchOut.isAfter(punchIn)) {
//     //           const duration = moment.duration(punchOut.diff(punchIn));
//     //           const hours = Math.floor(duration.asHours());
//     //           const minutes = Math.floor(duration.minutes());

//     //           // Format hours and minutes as "9h 46m"
//     //           workedHour = `${hours}h ${minutes}m`;

//     //           // Mark as present
//     //           attendanceStatus = "P";
//     //         }
//     //       }

//     //       return {
//     //         date: moment(date).format("DD MMM YYYY"),
//     //         day: dayOfWeek, // Add day of the week
//     //         status: approvalStatus, // Include approval status (Approved/Pending)
//     //         punchIn: punchIn ? punchIn.format("hh:mm A") : null,  // Format time as "10:25 AM"
//     //         punchOut: punchOut ? punchOut.format("hh:mm A") : null,  // Format time as "07:54 PM"
//     //         workedHours: workedHour, // Use the formatted hours and minutes
//     //         attendance: attendanceStatus, // P for Present, A for Absent
//     //       };
//     //     }

//     //     // Default response if no attendance for the date
//     //     return {
//     //       date: moment(date).format("DD MMM YYYY"),
//     //       day: dayOfWeek, // Include the day of the week
//     //       status:"Absent", // Default approval status
//     //       punchIn: null,
//     //       punchOut: null,
//     //       workedHours: "0h 0m", // No punch-in or punch-out
//     //       attendance: "A", // Absent
//     //     };
//     //   })
//     // );

//     const items = await Promise.all(
//       allDatesInRange.map(async (date) => {
//         const formattedDate = moment(date).format("YYYY-MM-DD");

//         // Determine the day of the week (e.g., "Monday", "Tuesday", etc.)
//         const dayOfWeek = moment(formattedDate).format("dddd");

//         if (attendanceMap[formattedDate]) {
//           const punchIn = attendanceMap[formattedDate].punchInTime
//             ? moment(attendanceMap[formattedDate].punchInTime, "YYYY-MM-DDTHH:mm:ss A")
//             : null;
//           const punchOut = attendanceMap[formattedDate].punchOutTime
//             ? moment(attendanceMap[formattedDate].punchOutTime, "YYYY-MM-DDTHH:mm:ss A")
//             : "";  // Set to empty string if punchOutTime is not available

//           // Determine attendance status and worked hours
//           let attendanceStatus = "A"; // Default to Absent
//           let workedHour = "0h 0m"; // Default worked hours
//           let approvalStatus = attendanceMap[formattedDate].approvalStatus || "Absent"; // Get approval status from attendanceMap

//           // Mark attendance as present if punchIn exists
//           if (punchIn && punchIn.isValid()) {
//             attendanceStatus = "P"; // Set as Present if punchIn is valid

//             // Calculate worked hours if punchOut exists
//             if (punchOut && punchOut.isValid() && punchOut.isAfter(punchIn)) {
//               const duration = moment.duration(punchOut.diff(punchIn));
//               const hours = Math.floor(duration.asHours());
//               const minutes = Math.floor(duration.minutes());

//               // Format hours and minutes as "9h 46m"
//               workedHour = `${hours}h ${minutes}m`;
//             }
//           }

//           return {
//             date: moment(date).format("DD MMM YYYY"),
//             day: dayOfWeek, // Add day of the week
//             status: approvalStatus, // Include approval status (Approved/Pending)
//             punchIn: punchIn ? punchIn.format("hh:mm A") : null,  // Format time as "10:25 AM"
//             punchOut: punchOut ? punchOut.format("hh:mm A") : "",  // Format punchOut time or empty string
//             workedHours: workedHour, // Use the formatted hours and minutes
//             attendance: attendanceStatus, // P for Present, A for Absent
//           };
//         }

//         // Default response if no attendance for the date
//         return {
//           date: moment(date).format("DD MMM YYYY"),
//           day: dayOfWeek, // Include the day of the week
//           status: "Absent", // Default approval status
//           punchIn: null,
//           punchOut: "",
//           workedHours: "0h 0m", // No punch-in or punch-out
//           attendance: "A", // Absent
//         };
//       })
//     );

//     res.status(200).json({
//       success: true,
//       message: "Attendance for the month fetched successfully.",
//       data: {
//         year: selectedYear,
//         month: selectedMonth,
//         monthDays: daysToConsider,
//         absentDays: absentCount,
//         presentDays: totalPresentCount, // Total present days including Sundays
//         punchCount: presentCount, // Total present days including Sundays
//         sundayPresentCount: sundayPresentCount, // Only Sundays counted as present
//         halfDayTotalCount: halfDayTotalCount,
//         halfDayLatePunchInCount: halfDayLatePunchInCount,
//         halfDayEarlyPunchOutCount: halfDayEarlyPunchOutCount,
//         lateComingCount: lateComingCount,
//         earlyGoingCount: earlyGoingCount,
//         noPunchIn: noPunchIn,
//         noPunchOut: noPunchOut,
//         totalDeduction: totalDeduction,
//         paidLeave: paidLeave,
//         appliedLeaves: appliedLeaves,
//         finalPresent: finalPresent + paidLeave,
//         items,

//       },
//     });
//   } catch (error) {
//     console.error(error);
//     internalServerError(res, error.message);
//   }
// }

async function getAbsentDays(startDate, endDate, attendanceData) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  // console.log("attendanceData", attendanceData);

  let absentCount = 0;

  // Loop through all the days between startDate and endDate
  for (
    let currentDay = new Date(start);
    currentDay <= end;
    currentDay.setDate(currentDay.getDate() + 1)
  ) {
    // Skip Sundays (getDay() returns 0 for Sunday)
    if (currentDay.getDay() === 0) {
      continue;
    }

    // Format current date to 'dd MMM yyyy' for comparison with attendance data
    const formattedDate = currentDay.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Check if the current day is today, and if so, skip it from absent count
    if (
      currentDay.getDate() === today.getDate() &&
      currentDay.getMonth() === today.getMonth() &&
      currentDay.getFullYear() === today.getFullYear()
    ) {
      continue; // Skip today's attendance check
    }

    // Find the attendance record for the current day
    const attendance = attendanceData.find(
      (item) => item.date === formattedDate
    );

    // If punchIn is null, count as absent
    if (!attendance || !attendance.punchIn) {
      absentCount++;
    }
  }

  return absentCount;
}

function getAbsentDaysMobile(startDate, endDate, attendanceData) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  // console.log("attendanceData", attendanceData);

  let absentCount = 0;

  // Loop through all the days between startDate and endDate
  for (
    let currentDay = new Date(start);
    currentDay <= end;
    currentDay.setDate(currentDay.getDate() + 1)
  ) {
    // Skip Sundays (getDay() returns 0 for Sunday)
    if (currentDay.getDay() === 0) {
      continue;
    }

    // Format current date to 'dd MMM yyyy' for comparison with attendance data
    const formattedDate = currentDay.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Check if the current day is today, and if so, skip it from absent count
    if (
      currentDay.getDate() === today.getDate() &&
      currentDay.getMonth() === today.getMonth() &&
      currentDay.getFullYear() === today.getFullYear()
    ) {
      continue; // Skip today's attendance check
    }

    // Find the attendance record for the current day
    const attendance = attendanceData.find(
      (item) => item.date === formattedDate
    );

    // If punchIn is null, count as absent
    if (!attendance || !attendance.punchIn) {
      absentCount++;
    }
  }

  return absentCount;
}

// --------- SUNDAY PUNCHIN FUNCTION  --------- //

async function sundayconfuction(employeeId, startDates, endDates) {
  const findOneEmployee = await employeeModel
    .findById(employeeId)
    .select("departmentId");

  const startDate = new Date(startDates);
  let endDate = new Date(endDates);

  endDate.setHours(23, 59, 59, 999);

  let sundayDates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() === 0) {
      // 0 represents Sunday
      sundayDates.push(currentDate.toISOString().split("T")[0]);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const sundayCount = await sundayModel.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        "department.departmentId": Array.isArray(findOneEmployee.departmentId)
          ? { $in: findOneEmployee.departmentId }
          : findOneEmployee.departmentId, // Fix department filtering
      },
    },
    {
      $group: {
        _id: null,
        dates: {
          $push: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        },
      },
    },
    {
      $project: {
        _id: 0,
        dates: 1,
      },
    },
  ]);

  const existingSundays = sundayCount[0]?.dates || [];

  const attendanceSundays = await attendanceModel.find({
    employeeId: employeeId, // Ensure it's for the specific employee
    date: { $gte: startDate, $lte: endDate },
    approvalStatus: "approved", // Only consider approved attendance
    punchInTime: { $ne: null }, // Ensure punchInTime is not null
  });

  let attendanceSundaysDates = attendanceSundays
    .filter((record) => new Date(record.date).getDay() === 0) // Check for Sundays only
    .map((record) => new Date(record.date).toISOString().split("T")[0]);

  //  console.log("attendanceSundaysDates",attendanceSundaysDates);

  //  console.log("sundayDates",sundayDates);
  //  console.log("existingSundays",existingSundays);

  // Filter out the Sundays that are already present in the sundayModel
  let missingSundays = existingSundays.filter(
    (sunday) => !attendanceSundaysDates.includes(sunday)
  );
  //  console.log("missingSundays",missingSundays);
  if (missingSundays.length > 0) {
    return 0;
  }

  return attendanceSundaysDates.length;
}

/// ---------------- END OF SUNDAY PUNCHIN FUNCTION  ----------------- //

async function newMonthlyAttendance(req, res) {
  try {
    const {
      employeeId,
      month,
      year,
      startDate: queryStartDate,
      endDate: queryEndDate,
      weeklyFilter,
    } = req.query;

    if (!employeeId) {
      return badRequest(res, "Please provide employeeId");
    }

    const employeeDetail = await employeeModel
      .findById(employeeId)
      .select("-password")
      .populate("branchId", "name punchInTime punchOutTime")
      .populate("roleId", "roleName")
      .populate("reportingManagerId", "employeUniqueId employeName userName")
      .populate("departmentId", "name")
      .populate("subDepartmentId", "name")
      .populate("secondaryDepartmentId", "name")
      .populate("seconSubDepartmentId", "name")
      .populate("designationId", "name")
      .populate("workLocationId", "name")
      .populate("constCenterId", "title")
      .populate("employementTypeId", "title")
      .populate("employeeTypeId", "title")
      .sort({ createdAt: -1 });

    if (!employeeDetail || !employeeDetail.branchId) {
      throw new Error("Branch details not found for the employee.");
    }

    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentDate = new Date();

    let startDate;
    let effectiveEndDate;
    const { startDate: defaultStartDate, endDate: defaultEndDate } =
      getMonthDateRange(selectedMonth, selectedYear);

    // If the weekly filter is enabled
    if (weeklyFilter === "true") {
      // Get the first day of the current week and today's date
      const weekStart = moment().startOf("isoWeek").format("YYYY-MM-DD"); // Start of this week
      const weekEnd = moment().format("YYYY-MM-DD"); // Today's date as end of this week

      // console.log("weekStart", weekStart);
      // console.log("weekEnd", weekEnd);

      // Set startDate to the start of this week and effectiveEndDate to today
      startDate = new Date(new Date(weekStart).setHours(0, 0, 0, 0));
      effectiveEndDate = new Date(new Date(weekEnd).setHours(23, 59, 59, 999));

      // console.log("startDate", startDate);
      // console.log("effectiveEndDate", effectiveEndDate);
    } else {
      console.log("defaultEndDate", defaultEndDate);
      // Use queryStartDate and queryEndDate if available, otherwise use defaults
      startDate = queryStartDate ? new Date(queryStartDate) : defaultStartDate;
      // endDate = queryEndDate ? new Date(queryEndDate) : defaultEndDate;
      endDate = queryEndDate
        ? new Date(queryEndDate)
        : new Date(new Date(defaultEndDate).setHours(23, 59, 59, 999));

      // Limit `effectiveEndDate` to today if the selected month is the current month
      effectiveEndDate = queryEndDate
        ? new Date(new Date(queryEndDate).setHours(23, 59, 59, 999)) // Use provided queryEndDate
        : selectedYear === currentDate.getFullYear() &&
          selectedMonth === currentDate.getMonth() + 1
        ? endDate > currentDate
          ? currentDate
          : endDate // If selected month is current, limit to today
        : endDate; // Otherwise, use the default or provided endDate
    }

    // Normalize the dates to remove the time portion
    // startDate = new Date(startDate.setHours(0, 0, 0, 0)); // Start of the day
    // effectiveEndDate = new Date(effectiveEndDate.setHours(23, 59, 59, 999)); // End of the day

    startDate = new Date(startDate); // Start of the day
    effectiveEndDate = new Date(effectiveEndDate); // End of the day

    console.log("effectiveEndDate", effectiveEndDate);

    // Convert the normalized startDate and effectiveEndDate to 'YYYY-MM-DD' format for comparison
    const normalizedStartDate = new Date(startDate).toISOString().split("T")[0]; // "2025-01-23"
    const normalizedEndDate = new Date(effectiveEndDate)
      .toISOString()
      .split("T")[0]; // "2025-01-26"

    // ---------------  HOLIDAY PUNCHIN FUNCTION  ----------------- //

    const holidaysData = await holidayModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: effectiveEndDate },
        },
      },
      {
        $group: {
          _id: null,
          dates: { $push: "$date" }, // Collect all holiday dates
          holidayCount: { $sum: 1 }, // Count holidays
        },
      },
      {
        $project: {
          _id: 0,
          dates: 1, // List of holiday dates
          holidayCount: 1, // Total holiday count
        },
      },
    ]);

    // ---------------- END OF HOLIDAY PUNCHIN FUNCTION  ----------------- //

    const attendanceRecords = await attendanceModel.find({
      employeeId: new ObjectId(employeeId),
      date: {
        $gte: startDate, // Compare from the start of the day
        $lte: effectiveEndDate, // Compare until the end of the day
      },
      approvalStatus: "approved",
    });

    let presentCount = 0;
    let totalPresentCount = 0;
    let sundayPresentCount = 0;
    let halfDayTotalCount = 0;
    let halfDayLatePunchInCount = 0;
    let halfDayEarlyPunchOutCount = 0;
    let lateComingCount = 0;
    let earlyGoingCount = 0;
    let noPunchIn = 0;
    let afterFourHourPunchIn = 0;
    let noPunchOut = 0;
    let totalDeduction = 0;
    let finalPresent = 0;
    let paidLeave = 0;
    let appliedLeaves = 0;
    let holidayPunchIn = 0;
    let sundayPunchIn = 0;

    attendanceRecords.forEach((record) => {
      if (record.punchInTime) {
        const recordPunchInTime = moment(
          record.punchInTime,
          "YYYY-MM-DDTHH:mm:ss A"
        );

        const branchRawPunchInTime = moment(
          employeeDetail.branchId.punchInTime,
          "YYYY-MM-DDTHH:mm:ss A"
        ).format("HH:mm:ss"); // Extract branch punch-in time (HH:mm:ss)

        const branchPunchInTime = moment(
          `${recordPunchInTime.format("YYYY-MM-DD")}T${branchRawPunchInTime}`,
          "YYYY-MM-DDTHH:mm:ss"
        ); // Combine record punch-in date with branch punch-in time

        const diffMinutes = recordPunchInTime.diff(
          branchPunchInTime,
          "minutes"
        );
        // console.log("recordPunchInTime",recordPunchInTime);
        // console.log("branchPunchInTime",branchPunchInTime);
        // console.log("diffMinutes",diffMinutes);
        if (diffMinutes <= 15) {
          // Within branch punch-in time + 15 minutes
          presentCount += 1;
        } else if (diffMinutes > 15 && diffMinutes <= 45) {
          // Between branch punch-in time + 15 and +30 minutes
          // console.log(diffMinutes);
          presentCount += 1;
          lateComingCount += 1;
        } else if (diffMinutes > 45) {
          // Beyond branch punch-in time + 45 minutes
          const fourHourCutoff = branchPunchInTime.clone().add(4, "hours");

          // console.log("recordPunchInTime",recordPunchInTime);

          if (recordPunchInTime.isAfter(fourHourCutoff)) {
            // Punched in after 4 hours from branch punch-in time
            noPunchIn += 1; // Mark as no punch-in or take other action
            afterFourHourPunchIn += 1;
            presentCount += 1; // added by harshal
          } else {
            presentCount += 1;
            halfDayLatePunchInCount += 0.5;
            halfDayTotalCount += 0.5;
          }
        }

        // ----------------       // Check if the punch-in time is a holiday --------------------------

        const changedRecordPunchInTime = new Date(
          new Date(recordPunchInTime).setHours(0, 0, 0, 0)
        );

        const isHoliday = holidaysData.some((holiday) =>
          holiday.dates.some((date) => {
            const holidayDate = new Date(new Date(date).setHours(0, 0, 0, 0));
            return holidayDate.getTime() === changedRecordPunchInTime.getTime();
          })
        );

        if (isHoliday) {
          presentCount -= holidaysData[0].holidayCount;
          holidayPunchIn += holidaysData[0].holidayCount;
        }

        ///////////// ------------------  END OF HOLIDAY PUNCHIN FUNCTION  ----------------------------- //////////////////////////
      } else {
        noPunchIn += 1;
        afterFourHourPunchIn += 1;
      }

      if (record.punchOutTime) {
        const punchOutDate = moment(
          record.punchOutTime,
          "YYYY-MM-DDTHH:mm:ss A"
        ); // Parse punch-out time

        const branchRawPunchOutTime = moment(
          employeeDetail.branchId.punchOutTime,
          "YYYY-MM-DDTHH:mm:ss A"
        ).format("HH:mm:ss"); // Extract branch punch-out time (HH:mm:ss)

        const branchPunchOutTime = moment(
          `${punchOutDate.format("YYYY-MM-DD")}T${branchRawPunchOutTime}`,
          "YYYY-MM-DDTHH:mm:ss"
        ); // Combine record punch-out date with branch punch-out time

        // Calculate difference in minutes
        const diffMinutes = punchOutDate.diff(branchPunchOutTime, "minutes");

        // Logic for punch-out before 1 hour from branch punch-out timing: Half day
        if (diffMinutes < -60) {
          halfDayEarlyPunchOutCount += 0.5;
          halfDayTotalCount += 0.5; // Add to total half-day count
        }
        // Logic for punch-out within 1 hour before branch punch-out timing to branch punch-out time: Early leaving
        else if (diffMinutes >= -60 && diffMinutes <= 0) {
          earlyGoingCount += 1; // Add to early leaving count
        }
      } else {
        // console.log("no punch out");
        noPunchOut += 1; // No punch-out recorded
      }
    });

    const firstParameter = queryStartDate
      ? new Date(queryStartDate)
      : new Date(selectedYear, selectedMonth - 1, 1);
    const secondParameter = queryEndDate
      ? new Date(queryEndDate)
      : new Date(selectedYear, selectedMonth, 0);
    let sundaysInMonth;

    if (weeklyFilter === "true") {
      // Get Sundays based on the selected parameters
      sundaysInMonth = getSundaysInMonth(startDate, effectiveEndDate).filter(
        (sunday) => sunday <= effectiveEndDate
      );
    } else {
      // Get Sundays based on the selected parameters
      sundaysInMonth = getSundaysInMonth(
        firstParameter,
        secondParameter
      ).filter((sunday) => sunday <= effectiveEndDate);
    }

    // console.log("sundaysInMonth",sundaysInMonth);

    // Count Sundays that are not already present in attendanceRecords
    const sundayDates = sundaysInMonth.map(
      (sunday) => sunday.toISOString().split("T")[0]
    );

    // console.log("sundayDates",sundayDates);

    const presentDates = attendanceRecords.map(
      (record) => record.date.toISOString().split("T")[0]
    );
    // console.log("presentDates",presentDates);
    // sundayPresentCount = sundayDates.filter(
    //   (sunday) => !presentDates.includes(sunday)
    // ).length;
    // console.log("sundayPresentCount",sundayPresentCount);

    // Simply count the Sundays in sundayDates
    sundayPresentCount = sundayDates.length;

    // Add undays to present count
    totalPresentCount = presentCount + sundayPresentCount;

    const daysToConsider =
      selectedYear === currentDate.getFullYear() &&
      selectedMonth === currentDate.getMonth() + 1
        ? currentDate.getDate()
        : new Date(selectedYear, selectedMonth, 0).getDate();

    console.log("daysToConsider", daysToConsider);

    // const absentCount = daysToConsider - totalPresentCount;

    const policyData = await policyModel
      .findOne({})
      .sort({ createdAt: 1 })
      .exec();

    let halfDay = 0;
    const defaultLateComingAllowed = 3;
    const defaultEarlyGoingAllowed = 3;

    const lateComingAllowed = policyData
      ? policyData.lateComingAllowed
      : defaultLateComingAllowed;
    const earlyGoingAllowed = policyData
      ? policyData.earlyGoingAllowed
      : defaultEarlyGoingAllowed;

    if (lateComingCount > lateComingAllowed) {
      halfDay += lateComingCount - lateComingAllowed;
    }
    if (earlyGoingCount > earlyGoingAllowed) {
      halfDay += earlyGoingCount - earlyGoingAllowed;
    }

    totalDeduction = halfDayTotalCount + halfDay / 2;
    finalPresent = totalPresentCount - totalDeduction;

    // Create a set of all dates between startDate and endDate
    // console.log("startDate",startDate);

    const allDatesInRange = getAllDates(normalizedStartDate, normalizedEndDate);
    // console.log("allDatesInRange",allDatesInRange);

    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      const formattedDate = moment(record.date).format("YYYY-MM-DD");
      attendanceMap[formattedDate] = record;
    });

    const endOfToday = moment().endOf("day"); // Get the end of today (23:59:59)

    // Filter out future dates from allDatesInRange
    const validDates = allDatesInRange.filter((date) =>
      moment(date).isSameOrBefore(endOfToday)
    );

    // Process only validDates
    const items = await Promise.all(
      validDates.map(async (date) => {
        const formattedDate = moment(date).format("YYYY-MM-DD");

        const newHoliday = await holidayModel.aggregate([
          {
            $match: {
              date: new Date(formattedDate),
              status: "active",
            },
          },
        ]);

        let Holiday = "A";
        let HolidayStatus = "Absent";

        if (newHoliday.length > 0) {
          Holiday = "H";
          HolidayStatus = "Holiday";
        }

        // Determine the day of the week (e.g., "Monday", "Tuesday", etc.)
        const dayOfWeek = moment(formattedDate).format("dddd");
        let sundayAttendence = "A";

        if (attendanceMap[formattedDate]) {
          const punchIn = attendanceMap[formattedDate].punchInTime
            ? moment(
                attendanceMap[formattedDate].punchInTime,
                "YYYY-MM-DDTHH:mm:ss A"
              )
            : null;
          const punchOut = attendanceMap[formattedDate].punchOutTime
            ? moment(
                attendanceMap[formattedDate].punchOutTime,
                "YYYY-MM-DDTHH:mm:ss A"
              )
            : ""; // Set to empty string if punchOutTime is not available

          // Extract employeeId
          const employeeId = attendanceMap[formattedDate].employeeId;

          // day == sunday

          // Determine attendance status and worked hours
          let attendanceStatus = "A"; // Default to Absent
          let workedHour = "0h 0m"; // Default worked hours
          let approvalStatus =
            attendanceMap[formattedDate].approvalStatus || "Absent"; // Get approval status from attendanceMap
          // Determine the day of the week (e.g., "Monday", "Tuesday", etc.)

          // Mark attendance as present if punchIn exists
          if (punchIn && punchIn.isValid()) {
            attendanceStatus = "P"; // Set as Present if punchIn is valid

            // Calculate worked hours if punchOut exists //
            if (punchOut && punchOut.isValid() && punchOut.isAfter(punchIn)) {
              const duration = moment.duration(punchOut.diff(punchIn));
              const hours = Math.floor(duration.asHours());
              const minutes = Math.floor(duration.minutes());

              // Format hours and minutes as "9h 46m" //
              workedHour = `${hours}h ${minutes}m`;
            }
          }

          return {
            employeeId, // Include employeeId in the return object
            date: moment(date).format("DD MMM YYYY"),
            day: dayOfWeek, // Add day of the week
            status: approvalStatus, // Include approval status (Approved/Pending)
            punchIn: punchIn ? punchIn.format("hh:mm A") : null, // Format time as "10:25 AM"
            punchOut: punchOut ? punchOut.format("hh:mm A") : "", // Format punchOut time or empty string
            workedHours: workedHour, // Use the formatted hours and minutes
            attendance: attendanceStatus, // P for Present, A for Absent
          };
        }

        if (dayOfWeek == "Sunday") {
          sundayAttendence = "P";
        }

        // Default response if no attendance for the date
        return {
          date: moment(date).format("DD MMM YYYY"),
          day: dayOfWeek, // Include the day of the week
          status: HolidayStatus ? HolidayStatus : "Absent", // Default approval status
          punchIn: null,
          punchOut: "",
          workedHours: "0h 0m", // No punch-in or punch-out
          attendance:
            Holiday == "A" && dayOfWeek == "Sunday"
              ? sundayAttendence
              : Holiday,
        };
      })
    );

    const absenddayss = await getAbsentDaysMobile(
      startDate,
      effectiveEndDate,
      items
    );
    const holidayCount = await holidays(startDate, effectiveEndDate, items);
    const sundayworkingCount = await sundayWorkCountMobile(
      startDate,
      effectiveEndDate,
      items
    );

    const sundayPunchInCount = await sundayconfuction(
      employeeId,
      startDate,
      effectiveEndDate
    );

    if (sundayPunchInCount) {
      sundayPunchIn += sundayPunchInCount;
    }

    res.status(200).json({
      success: true,
      message: "Attendance for the month fetched successfully.",
      data: {
        year: selectedYear,
        month: selectedMonth,
        monthDays: daysToConsider,
        // absentDays: absenddayss- holidayCount, // Absent days excluding holidays
        absentDays: Math.max(absenddayss - holidayCount + holidayPunchIn, 0), // Absent days excluding holidays
        presentDays: totalPresentCount, // Total present days including Sundays
        punchCount: presentCount - sundayPunchIn, // Total present days including Sundays
        sundayPresentCount: sundayPresentCount - sundayworkingCount.sundayCount, // Only Sundays counted as present
        holidayCount: holidayCount,
        holidayPunchIn: holidayPunchIn,
        sundayworkingCount: sundayworkingCount.sundayCount,
        sundayworkingnotPunchIn: sundayworkingCount.sundayWorkingNotPunchIn,
        sundaypunchIn: sundayPunchIn,
        halfDayTotalCount: halfDayTotalCount,
        halfDayLatePunchInCount: halfDayLatePunchInCount,
        halfDayEarlyPunchOutCount: halfDayEarlyPunchOutCount,
        lateComingCount: lateComingCount,
        earlyGoingCount: earlyGoingCount,
        noPunchIn: noPunchIn,
        noPunchOut: noPunchOut,
        afterFourHourPunchIn: afterFourHourPunchIn,
        totalDeduction: totalDeduction,
        paidLeave: paidLeave,
        appliedLeaves: appliedLeaves,
        finalPresent: finalPresent + paidLeave,
        items,
      },
    });
  } catch (error) {
    console.error(error);
    internalServerError(res, error.message);
  }
}

// async function getEmployeeMonthlyAttendance(req, res) {
//   try {
//     const { employeeId, month, year , startDate, endDate } = req.query;

//     if (!employeeId) {
//       return badRequest(res, "Please provide employeeId");
//     }
//     // console.log("-------------------->", employeeId);
//     const employeeDetail = await employeeModel
//       .findById(employeeId)
//       .select("-password")
//       .populate("branchId", "name  punchInTime punchOutTime")
//       .populate("roleId", "roleName")
//       .populate("reportingManagerId", "employeUniqueId employeName userName")
//       .populate("departmentId", "name")
//       .populate("subDepartmentId", "name")
//       .populate("secondaryDepartmentId", "name")
//       .populate("seconSubDepartmentId", "name")
//       .populate("designationId", "name")
//       .populate("workLocationId", "name")
//       .populate("constCenterId", "title")
//       .populate("employementTypeId", "title")
//       .populate("employeeTypeId", "title")
//       .sort({ createdAt: -1 });

//     if (!employeeDetail || !employeeDetail.branchId) {
//       throw new Error("Branch details not found for the employee.");
//     }

//     const selectedYear = year ? parseInt(year) : new Date().getFullYear();
//     const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
//     const currentDate = new Date();

//     const { startDate:defaultStartDate , endDate:defaultEndDate } = getMonthDateRange(
//       selectedMonth,
//       selectedYear
//     );
//     console.log("startDate", startDate);
//     console.log(endDate);

//        // Use provided startDate and endDate if present, else default ones
//        const finalStartDate = startDate ? new Date(startDate) : defaultStartDate;
//        const finalEndDate = endDate ? new Date(endDate) : defaultEndDate;

//     // Limit `endDate` to today if the selected month is the current month
//     const effectiveEndDate =
//       selectedYear === currentDate.getFullYear() &&
//       selectedMonth === currentDate.getMonth() + 1
//         ? currentDate
//         : finalEndDate;

//     const attendanceRecords = await attendanceModel.find({
//       employeeId: new ObjectId(employeeId),
//       date: { $gte: finalStartDate, $lte: effectiveEndDate },
//       approvalStatus: "approved",
//     });

//     let presentCount = 0;
//     let totalPresentCount = 0;
//     let sundayPresentCount = 0;
//     let halfDayTotalCount = 0;
//     let halfDayLatePunchInCount = 0;
//     let halfDayEarlyPunchOutCount = 0;
//     let lateComingCount = 0;
//     let earlyGoingCount = 0;
//     let noPunchIn = 0;
//     let noPunchOut = 0;
//     let totalDeduction = 0;
//     let finalPresent = 0;
//     let paidLeave = 0;
//     let appliedLeaves = 0;
//     // Count days the employee has punched in
//     // attendanceRecords.forEach((record) => {
//     //   if (record.punchInTime) {
//     //     presentCount++;
//     //   }

//     // });
//     attendanceRecords.forEach((record) => {
//       if (record.punchInTime) {
//         const recordPunchInTime = moment(
//           record.punchInTime,
//           "YYYY-MM-DDTHH:mm:ss A"
//         );

//         const branchRawPunchInTime = moment(
//           employeeDetail.branchId.punchInTime,
//           "YYYY-MM-DDTHH:mm:ss A"
//         ).format("HH:mm:ss"); // Extract branch punch-in time (HH:mm:ss)

//         const branchPunchInTime = moment(
//           `${recordPunchInTime.format("YYYY-MM-DD")}T${branchRawPunchInTime}`,
//           "YYYY-MM-DDTHH:mm:ss"
//         ); // Combine record punch-in date with branch punch-in time

//         const diffMinutes = recordPunchInTime.diff(
//           branchPunchInTime,
//           "minutes"
//         );
//         // console.log("recordPunchInTime",recordPunchInTime);
//         // console.log("branchPunchInTime",branchPunchInTime);
//         // console.log("diffMinutes",diffMinutes);
//         if (diffMinutes <= 15) {
//           // Within branch punch-in time + 15 minutes
//           presentCount += 1;
//         } else if (diffMinutes > 15 && diffMinutes <= 45) {
//           // Between branch punch-in time + 15 and +30 minutes
//           // console.log(diffMinutes);
//           presentCount += 1;
//           lateComingCount += 1;
//         } else if (diffMinutes > 45) {
//           // Beyond branch punch-in time + 45 minutes
//           const fourHourCutoff = branchPunchInTime.clone().add(4, "hours");

//           if (recordPunchInTime.isAfter(fourHourCutoff)) {
//             // Punched in after 4 hours from branch punch-in time
//             noPunchIn += 1; // Mark as no punch-in or take other action
//           } else {
//             presentCount += 1;
//             halfDayLatePunchInCount += 0.5;
//             halfDayTotalCount += 0.5;
//           }
//         }
//       } else {
//         noPunchIn += 1;
//       }

//       if (record.punchOutTime) {
//         const punchOutDate = moment(
//           record.punchOutTime,
//           "YYYY-MM-DDTHH:mm:ss A"
//         ); // Parse punch-out time

//         const branchRawPunchOutTime = moment(
//           employeeDetail.branchId.punchOutTime,
//           "YYYY-MM-DDTHH:mm:ss A"
//         ).format("HH:mm:ss"); // Extract branch punch-out time (HH:mm:ss)

//         const branchPunchOutTime = moment(
//           `${punchOutDate.format("YYYY-MM-DD")}T${branchRawPunchOutTime}`,
//           "YYYY-MM-DDTHH:mm:ss"
//         ); // Combine record punch-out date with branch punch-out time

//         // Calculate difference in minutes
//         const diffMinutes = punchOutDate.diff(branchPunchOutTime, "minutes");

//         // Logic for punch-out before 1 hour from branch punch-out timing: Half day
//         if (diffMinutes < -60) {
//           halfDayEarlyPunchOutCount += 0.5;
//           halfDayTotalCount += 0.5; // Add to total half-day count
//         }
//         // Logic for punch-out within 1 hour before branch punch-out timing to branch punch-out time: Early leaving
//         else if (diffMinutes >= -60 && diffMinutes <= 0) {
//           earlyGoingCount += 1; // Add to early leaving count
//         }
//       } else {
//         noPunchOut += 1; // No punch-out recorded
//       }
//     });

//     const sundaysInMonth = getSundaysInMonth(
//       selectedMonth,
//       selectedYear
//     ).filter((sunday) => sunday <= effectiveEndDate);

//     const sundayDates = sundaysInMonth.map(
//       (sunday) => sunday.toISOString().split("T")[0]
//     );

//     const presentDates = attendanceRecords.map(
//       (record) => record.date.toISOString().split("T")[0]
//     );

//     sundayPresentCount = sundayDates.filter(
//       (sunday) => !presentDates.includes(sunday)
//     ).length;

//     // Add Sundays to present count
//     totalPresentCount = presentCount + sundayPresentCount;

//     const daysToConsider =
//       selectedYear === currentDate.getFullYear() &&
//       selectedMonth === currentDate.getMonth() + 1
//         ? currentDate.getDate()
//         : new Date(selectedYear, selectedMonth, 0).getDate();

//     const absentCount = daysToConsider - totalPresentCount;
//     const policyData = await policyModel
//       .findOne({})
//       .sort({ createdAt: 1 })
//       .exec();

//     let halfDay = 0;
//     const defaultLateComingAllowed = 3;
//     const defaultEarlyGoingAllowed = 3;

//     const lateComingAllowed = policyData
//       ? policyData.lateComingAllowed
//       : defaultLateComingAllowed;
//     const earlyGoingAllowed = policyData
//       ? policyData.earlyGoingAllowed
//       : defaultEarlyGoingAllowed;

//     if (lateComingCount > lateComingAllowed) {
//       halfDay += lateComingCount - lateComingAllowed;
//     }
//     if (earlyGoingCount > earlyGoingAllowed) {
//       halfDay += earlyGoingCount - earlyGoingAllowed;
//     }

//     totalDeduction = halfDayTotalCount + halfDay / 2;
//     finalPresent = totalPresentCount - totalDeduction;

//     // Create a set of all dates between startDate and endDate
//     const allDatesInRange = getAllDatesInRange(finalStartDate, finalEndDate);

//     // Map attendanceRecords to a date-based dictionary for fast lookup
//     const attendanceMap = {};
//     attendanceRecords.forEach((record) => {
//       const formattedDate = moment(record.date).format("YYYY-MM-DD");
//       attendanceMap[formattedDate] = record;
//     });
//     const fullAttendanceRecords = await Promise.all(
//       allDatesInRange.map(async (date) => {

//         // const currentFormattedDate = moment
//         //   .tz(`${date} 00:00:00`, "Asia/Kolkata") // Append time and parse in Asia/Kolkata timezone
//         //   .startOf("day") // Ensure the time is set to the start of the day
//         //   .toDate(); // Convert to a JavaScript Date object
//         const currentFormattedDate = date;

//         const formattedDate = moment(currentFormattedDate).format("YYYY-MM-DD");

//         // Check if the date has attendance or needs to consider leave
//         if (attendanceMap[formattedDate]) {
//           const punchIn = attendanceMap[formattedDate].punchInTime
//             ? moment(
//                 attendanceMap[formattedDate].punchInTime,
//                 "YYYY-MM-DDTHH:mm:ss A"
//               )
//             : null;
//           const punchOut = attendanceMap[formattedDate].punchOutTime
//             ? moment(
//                 attendanceMap[formattedDate].punchOutTime,
//                 "YYYY-MM-DDTHH:mm:ss A"
//               )
//             : punchIn
//             ? moment(punchIn).hour(15).minute(0).second(0) // Default to 3:00 PM if punchOut is empty
//             : null;

//           if (punchIn && punchOut && punchOut.isValid() && punchIn.isValid()) {
//             if (punchOut.isAfter(punchIn)) {
//               const duration = moment.duration(punchOut.diff(punchIn));
//               const hours = Math.floor(duration.asHours()); // Get total hours
//               const minutes = Math.floor(duration.asMinutes() % 60); // Get remaining minutes
//               attendanceMap[formattedDate].workedHour = `${hours}h ${minutes}m`; // Format worked hours
//               attendanceMap[formattedDate].attendance = "p"; // Format worked hours
//             }
//           }
//           return attendanceMap[formattedDate];
//         } else {
//           // Check for leave applied for this date
//           // console.log("attendanceMap[formattedDate]",attendanceMap[formattedDate]);
//           // console.log("currentFormattedDate",currentFormattedDate);
//           const leaveApplied = await employeeLeaveModel.findOne({
//             employeeId: new ObjectId(employeeId),
//             approvalByReportingManager: "yes",
//             startDate: { $lte: currentFormattedDate }, // Start date should be before or on the current date
//             endDate: { $gte: currentFormattedDate }, // End date should be after or on the current date
//           });

//           if (leaveApplied) {
//             const leaveStart = moment(leaveApplied.startDate).startOf("day");
//             const leaveEnd = moment(leaveApplied.endDate).startOf("day");
//             const leaveDuration = leaveEnd.diff(leaveStart, "days") + 1; // +1 to include the start date
//             console.log(leaveDuration);
//             const leaveAllowed = policyData? policyData.LeaveAllowed: 1;

//             if(leaveDuration>=leaveAllowed){
//               paidLeave = leaveAllowed;
//               appliedLeaves =leaveDuration;
//             }
//             return {
//               employeeId: employeeId,
//               date: currentFormattedDate,
//               punchInTime: moment(leaveApplied.startDate).isSame(
//                 currentFormattedDate,
//                 "day"
//               )
//                 ? null
//                 : null, // "PL" for the first date
//               punchOutTime: moment(leaveApplied.startDate).isSame(
//                 currentFormattedDate,
//                 "day"
//               )
//                 ? null
//                 : null,
//               workedHour: "",
//               attendance: moment(leaveApplied.startDate).isSame(
//                 currentFormattedDate,
//                 "day"
//               )
//                 ? "PL"
//                 : "A",
//               locationPunchIn: { type: "Point", coordinates: [] },
//               locationPunchOut: { type: "Point", coordinates: [] },
//               remark: leaveApplied.remark || "Leave Applied",
//               approvalStatus: leaveApplied.approvalByReportingManager,
//             };
//           }

//           // Default placeholder if no attendance or leave
//           return {
//             employeeId: employeeId,
//             date: currentFormattedDate,
//             punchInTime: null,
//             punchOutTime: null,
//             workedHour: "",
//             attendance:"A",
//             locationPunchIn: { type: "Point", coordinates: [] },
//             locationPunchOut: { type: "Point", coordinates: [] },
//             remark: "",
//             approvalStatus: "pending",
//           };
//         }
//       })
//     );

//     return success(res, "Employee Attendance List", {
//       year: selectedYear,
//       month: selectedMonth,
//       monthDays: daysToConsider,
//       absentDays: absentCount,
//       presentDays: totalPresentCount, // Total present days including Sundays
//       punchCount: presentCount, // Total present days including Sundays
//       sundayPresentCount: sundayPresentCount, // Only Sundays counted as present
//       halfDayTotalCount: halfDayTotalCount,
//       halfDayLatePunchInCount: halfDayLatePunchInCount,
//       halfDayEarlyPunchOutCount: halfDayEarlyPunchOutCount,
//       lateComingCount: lateComingCount,
//       earlyGoingCount: earlyGoingCount,
//       noPunchIn: noPunchIn,
//       noPunchOut: noPunchOut,
//       totalDeduction: totalDeduction,
//       paidLeave:paidLeave,
//       appliedLeaves:appliedLeaves,
//       finalPresent: finalPresent+paidLeave,
//       employeeDetail: employeeDetail,
//       attendanceRecords: attendanceRecords,
//       fullAttendanceRecords: fullAttendanceRecords,

//     });
//   } catch (error) {
//     console.error("Error fetching attendance data:", error);
//     unknownError(res, error);
//   }
// }

// for all employees data //
async function MonthlyAttendance(req, res) {
  try {
    const { month, year, startDate, endDate } = req.query;

    const employees = await employeeModel
      .find()
      .select("-password")
      .populate("branchId", "name punchInTime punchOutTime")
      .populate("roleId", "roleName")
      .populate("reportingManagerId", "employeUniqueId employeName userName")
      .populate("departmentId", "name")
      .populate("subDepartmentId", "name")
      .populate("secondaryDepartmentId", "name")
      .populate("seconSubDepartmentId", "name")
      .populate("designationId", "name")
      .populate("workLocationId", "name")
      .populate("constCenterId", "title")
      .populate("employementTypeId", "title")
      .populate("employeeTypeId", "title")
      .sort({ createdAt: -1 });

    if (!employees || employees.length === 0) {
      return badRequest(res, "No employees found for the given criteria.");
    }

    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentDate = new Date();

    const { startDate: defaultStartDate, endDate: defaultEndDate } =
      getMonthDateRange(selectedMonth, selectedYear);

    // Use provided startDate and endDate if present, else default ones
    const finalStartDate = startDate ? new Date(startDate) : defaultStartDate;
    const finalEndDate = endDate ? new Date(endDate) : defaultEndDate;

    // Limit `endDate` to today if the selected month is the current month
    const effectiveEndDate =
      selectedYear === currentDate.getFullYear() &&
      selectedMonth === currentDate.getMonth() + 1
        ? currentDate
        : finalEndDate;

    const allEmployeeAttendance = [];

    for (const employeeDetail of employees) {
      // Calculate attendance for each employee (reuse the same logic you already have)

      const attendanceRecords = await attendanceModel.find({
        employeeId: employeeDetail._id,
        date: { $gte: finalStartDate, $lte: effectiveEndDate },
        approvalStatus: "approved",
      });

      let presentCount = 0;
      let totalPresentCount = 0;
      let sundayPresentCount = 0;
      let halfDayTotalCount = 0;
      let halfDayLatePunchInCount = 0;
      let halfDayEarlyPunchOutCount = 0;
      let lateComingCount = 0;
      let earlyGoingCount = 0;
      let noPunchIn = 0;
      let noPunchOut = 0;
      let totalDeduction = 0;
      let finalPresent = 0;
      let paidLeave = 0;
      let appliedLeaves = 0;

      attendanceRecords.forEach((record) => {
        if (record.punchInTime) {
          const recordPunchInTime = moment(
            record.punchInTime,
            "YYYY-MM-DDTHH:mm:ss A"
          );

          const branchRawPunchInTime = moment(
            employeeDetail.branchId.punchInTime,
            "YYYY-MM-DDTHH:mm:ss A"
          ).format("HH:mm:ss"); // Extract branch punch-in time (HH:mm:ss)

          const branchPunchInTime = moment(
            `${recordPunchInTime.format("YYYY-MM-DD")}T${branchRawPunchInTime}`,
            "YYYY-MM-DDTHH:mm:ss"
          ); // Combine record punch-in date with branch punch-in time

          const diffMinutes = recordPunchInTime.diff(
            branchPunchInTime,
            "minutes"
          );

          if (diffMinutes <= 15) {
            // Within branch punch-in time + 15 minutes
            presentCount += 1;
          } else if (diffMinutes > 15 && diffMinutes <= 45) {
            // Between branch punch-in time + 15 and +30 minutes
            presentCount += 1;
            lateComingCount += 1;
          } else if (diffMinutes > 45) {
            // Beyond branch punch-in time + 45 minutes
            const fourHourCutoff = branchPunchInTime.clone().add(4, "hours");

            if (recordPunchInTime.isAfter(fourHourCutoff)) {
              // Punched in after 4 hours from branch punch-in time
              noPunchIn += 1; // Mark as no punch-in or take other action
            } else {
              presentCount += 1;
              halfDayLatePunchInCount += 0.5;
              halfDayTotalCount += 0.5;
            }
          }
        } else {
          noPunchIn += 1;
        }

        if (record.punchOutTime) {
          const punchOutDate = moment(
            record.punchOutTime,
            "YYYY-MM-DDTHH:mm:ss A"
          ); // Parse punch-out time

          const branchRawPunchOutTime = moment(
            employeeDetail.branchId.punchOutTime,
            "YYYY-MM-DDTHH:mm:ss A"
          ).format("HH:mm:ss"); // Extract branch punch-out time (HH:mm:ss)

          const branchPunchOutTime = moment(
            `${punchOutDate.format("YYYY-MM-DD")}T${branchRawPunchOutTime}`,
            "YYYY-MM-DDTHH:mm:ss"
          ); // Combine record punch-out date with branch punch-out time

          const diffMinutes = punchOutDate.diff(branchPunchOutTime, "minutes");

          // Logic for punch-out before 1 hour from branch punch-out timing: Half day
          if (diffMinutes < -60) {
            halfDayEarlyPunchOutCount += 0.5;
            halfDayTotalCount += 0.5; // Add to total half-day count
          }
          // Logic for punch-out within 1 hour before branch punch-out timing to branch punch-out time: Early leaving
          else if (diffMinutes >= -60 && diffMinutes <= 0) {
            earlyGoingCount += 1; // Add to early leaving count
          }
        } else {
          noPunchOut += 1; // No punch-out recorded
        }
      });

      const sundaysInMonth = getSundaysInMonth(
        selectedMonth,
        selectedYear
      ).filter((sunday) => sunday <= effectiveEndDate);

      const sundayDates = sundaysInMonth.map(
        (sunday) => sunday.toISOString().split("T")[0]
      );

      const presentDates = attendanceRecords.map(
        (record) => record.date.toISOString().split("T")[0]
      );

      sundayPresentCount = sundayDates.filter(
        (sunday) => !presentDates.includes(sunday)
      ).length;

      totalPresentCount = presentCount + sundayPresentCount;

      const daysToConsider =
        selectedYear === currentDate.getFullYear() &&
        selectedMonth === currentDate.getMonth() + 1
          ? currentDate.getDate()
          : new Date(selectedYear, selectedMonth, 0).getDate();

      const absentCount = daysToConsider - totalPresentCount;

      // Policy data fetching (leave, late, early)
      const policyData = await policyModel
        .findOne({})
        .sort({ createdAt: 1 })
        .exec();

      let halfDay = 0;
      const defaultLateComingAllowed = 3;
      const defaultEarlyGoingAllowed = 3;

      const lateComingAllowed = policyData
        ? policyData.lateComingAllowed
        : defaultLateComingAllowed;
      const earlyGoingAllowed = policyData
        ? policyData.earlyGoingAllowed
        : defaultEarlyGoingAllowed;

      if (lateComingCount > lateComingAllowed) {
        halfDay += lateComingCount - lateComingAllowed;
      }
      if (earlyGoingCount > earlyGoingAllowed) {
        halfDay += earlyGoingCount - earlyGoingAllowed;
      }

      totalDeduction = halfDayTotalCount + halfDay / 2;
      finalPresent = totalPresentCount - totalDeduction;

      const allDatesInRange = getAllDatesInRange(finalStartDate, finalEndDate);

      const attendanceMap = {};
      attendanceRecords.forEach((record) => {
        const formattedDate = moment(record.date).format("YYYY-MM-DD");
        attendanceMap[formattedDate] = record;
      });

      const fullAttendanceRecords = await Promise.all(
        allDatesInRange.map(async (date) => {
          const currentFormattedDate = date;
          const formattedDate =
            moment(currentFormattedDate).format("YYYY-MM-DD");

          if (attendanceMap[formattedDate]) {
            const punchIn = attendanceMap[formattedDate].punchInTime
              ? moment(
                  attendanceMap[formattedDate].punchInTime,
                  "YYYY-MM-DDTHH:mm:ss A"
                )
              : null;
            const punchOut = attendanceMap[formattedDate].punchOutTime
              ? moment(
                  attendanceMap[formattedDate].punchOutTime,
                  "YYYY-MM-DDTHH:mm:ss A"
                )
              : punchIn
              ? moment(punchIn).hour(15).minute(0).second(0)
              : null;

            if (
              punchIn &&
              punchOut &&
              punchOut.isValid() &&
              punchIn.isValid()
            ) {
              if (punchOut.isAfter(punchIn)) {
                const duration = moment.duration(punchOut.diff(punchIn));
                const hours = Math.floor(duration.asHours());
                const minutes = Math.floor(duration.asMinutes() % 60);
                attendanceMap[
                  formattedDate
                ].workedHour = `${hours}h ${minutes}m`;
                attendanceMap[formattedDate].attendance = "p";
              }
            }
          }

          return attendanceMap[formattedDate];
        })
      );

      allEmployeeAttendance.push({
        year: selectedYear,
        month: selectedMonth,
        monthDays: daysToConsider,
        absentDays: absentCount,
        presentDays: totalPresentCount,
        punchCount: presentCount,
        sundayPresentCount: sundayPresentCount,
        halfDayTotalCount: halfDayTotalCount,
        halfDayLatePunchInCount: halfDayLatePunchInCount,
        lateComingCount: lateComingCount,
        earlyGoingCount: earlyGoingCount,
        noPunchIn: noPunchIn,
        noPunchOut: noPunchOut,
        totalDeduction: totalDeduction,
        paidLeave: paidLeave,
        appliedLeaves: appliedLeaves,
        finalPresent: finalPresent,
        employeeDetail: employeeDetail,
        attendanceRecords: attendanceRecords,
        fullAttendanceRecords: fullAttendanceRecords,
      });
    }

    return success(res, "All Employee Attendance List", {
      allEmployeeAttendance,
    });
  } catch (error) {
    console.error("Error:", error);
    return internalServerError(res, error.message);
  }
}

// Helper function to get all dates in a range
function getAllDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = moment.tz(startDate, "Asia/Kolkata").startOf("day");
  const startMonth = currentDate.month();

  while (currentDate.isSameOrBefore(endDate, "day")) {
    // Check if the currentDate belongs to the same month as the startDate
    if (currentDate.month() === startMonth) {
      dates.push(currentDate.format("YYYY-MM-DD"));
    }

    currentDate = currentDate.add(1, "day");
  }

  return dates;
}

// added here to get all dates in a range in newattendance.js file //

function getAllDates(startDate, endDate) {
  const dates = [];

  // Convert both startDate and endDate to moment objects
  let currentDate = moment.tz(startDate, "Asia/Kolkata").startOf("day");
  let endMoment = moment
    .tz(endDate, "Asia/Kolkata")
    .startOf("day")
    .add(1, "day"); // Adjust the end date to the next day

  // Loop through dates from startDate to endDate (inclusive)
  while (currentDate.isBefore(endMoment, "day")) {
    // Includes both start and end date
    // Add the current date to the array
    dates.push(currentDate.format("YYYY-MM-DD"));

    // Increment currentDate by one day
    currentDate = currentDate.add(1, "day");
  }

  return dates;
}

function getSundaysInMonth(startDate, endDate) {
  const sundays = [];
  let date = new Date(startDate);

  // Adjust for Asia/Kolkata time zone
  const timeZoneOffset = 5.5 * 60; // Asia/Kolkata UTC offset in minutes
  const localOffset = date.getTimezoneOffset();

  date.setMinutes(date.getMinutes() + localOffset + timeZoneOffset);

  // Move to the first Sunday if the start date is not Sunday
  if (date.getDay() !== 0) {
    const daysToNextSunday = (7 - date.getDay()) % 7; // Calculate days to next Sunday
    date.setDate(date.getDate() + daysToNextSunday);
  }

  // Loop until we reach or go beyond the end date
  while (date <= endDate) {
    sundays.push(new Date(date)); // Add the Sunday to the array
    date.setDate(date.getDate() + 7); // Move to the next Sunday
  }

  return sundays;
}

//-----------------------------------------------------------------------------------------

// Holiday function //
async function holidays(startDate, endDate, dateWiseAttendance) {
  // Convert startDate and endDate to Date objects, assuming they are in ISO 8601 format
  const start = moment(startDate).startOf("day").toDate(); // Start of the day in UTC
  const end = moment(endDate).endOf("day").toDate(); // End of the day in UTC

  // Fetch holiday records from the model within the date range
  const holidayRecords = await holidayModel.find({
    date: { $gte: start, $lte: end },
  });

  // const holidayRecords = await holidayModel.find({
  //   date: { $gte: start, $lte: end },
  //   status: 'active' // Ensure that only holidays with status 'active' are fetched
  // });

  // console.log("holidayRecords" , holidayRecords)

  if (!holidayRecords || holidayRecords.length === 0) {
    return 0; // Return 0 if no holidays are found
  }

  // Filter dateWiseAttendance for records within the date range and if it's a holiday
  const holidaysInRange = dateWiseAttendance.filter((record) => {
    // Convert record.date to a moment object to ensure consistent comparison
    const recordDate = moment(record.date, "DD MMM YYYY").startOf("day"); // Convert to start of the day

    // Check if the record date is within the range and if it's a holiday
    const isHoliday = holidayRecords.some((holiday) => {
      const holidayDate = moment(holiday.date).startOf("day"); // Normalize holiday date to start of the day
      return holidayDate.isSame(recordDate, "day"); // Compare the day only
    });

    return isHoliday && recordDate.isBetween(start, end, null, "[]"); // Inclusive range
  });

  const holidayCount = holidaysInRange.length;
  return holidayCount;
}

// Sunday working function //
// Aggregate Sunday records with matching conditions
//  const sundayRecords = await sundayModel.aggregate([
//   {
//     $match: {
//       $and: [
//         { date: { $gte: start, $lte: end } },
//         {
//           $or: [
//             { departmentSelection: "All" },
//             { "department.departmentId": { $in: departmentIds } },
//           ],
//         },
//         { status: "active" }, // Ensure the status is 'active'
//       ],
//     },
//   },
// ]);

async function sundayWorkCount(startDate, endDate, dateWiseAttendance) {
  try {
    const start = moment.utc(startDate).startOf("day").toDate();
    const end = moment.utc(endDate).endOf("day").toDate();

    const employeeIds = dateWiseAttendance.map((record) => record.employeeId);
    const uniqueEmployeeIds = [...new Set(employeeIds)];

    const employees = await employeeModel.find(
      { _id: { $in: uniqueEmployeeIds } },
      "departmentId"
    );

    const departmentIds = employees.map((employee) => employee.departmentId);

    const sundayRecords = await sundayModel.aggregate([
      {
        $match: {
          $or: [
            { departmentSelection: "All" },
            {
              $and: [
                { "department.departmentId": { $in: departmentIds } },
                { date: { $gte: start, $lte: end } },
              ],
            },
          ],
        },
      },
    ]);

    const sundayDates = sundayRecords.map((record) =>
      moment.utc(record.date).format("DD MMM YYYY")
    );

    // Filter attendance for Sundays
    const sundayAttendance = dateWiseAttendance.filter((record) =>
      sundayDates.includes(record.date)
    );

    // Count employees with missing punch-in on Sundays
    const sundayWorkingNotPunchIn = sundayAttendance.filter(
      (record) => !record.punchInTime
    ).length;

    return { sundayCount: sundayRecords.length || 0, sundayWorkingNotPunchIn };
    // const sundayCount = sundayRecords.length;
    // return sundayCount || 0;
  } catch (error) {
    console.error("Error in sundayWorkCount:", error);
    throw new Error("Unable to calculate Sunday working count");
  }
}

// for mobile
async function sundayWorkCountMobile(startDate, endDate, dateWiseAttendance) {
  try {
    const start = moment.utc(startDate).startOf("day").toDate();
    const end = moment.utc(endDate).endOf("day").toDate();

    const employeeIds = dateWiseAttendance.map((record) => record.employeeId);
    const uniqueEmployeeIds = [...new Set(employeeIds)];

    const employees = await employeeModel.find(
      { _id: { $in: uniqueEmployeeIds } },
      "departmentId"
    );

    const departmentIds = employees.map((employee) => employee.departmentId);

    const sundayRecords = await sundayModel.aggregate([
      {
        $match: {
          $or: [
            { departmentSelection: "All" },
            {
              $and: [
                { "department.departmentId": { $in: departmentIds } },
                { date: { $gte: start, $lte: end } },
              ],
            },
          ],
        },
      },
    ]);

    const sundayDates = sundayRecords.map((record) =>
      moment.utc(record.date).format("DD MMM YYYY")
    );

    // Filter attendance for Sundays
    const sundayAttendance = dateWiseAttendance.filter((record) =>
      sundayDates.includes(record.date)
    );

    // Count employees with missing punch-in on Sundays
    const sundayWorkingNotPunchIn = sundayAttendance.filter(
      (record) => !record.punchIn
    ).length;

    return { sundayCount: sundayRecords.length || 0, sundayWorkingNotPunchIn };
    // const sundayCount = sundayRecords.length;
    // return sundayCount || 0;
  } catch (error) {
    console.error("Error in sundayWorkCount:", error);
    throw new Error("Unable to calculate Sunday working count");
  }
}

// for web
async function sundayconfuction_web(employeeId, startDates, endDates) {
  // 1. Fetch the employee's departmentId.

  const employee = await employeeModel
    .findById(employeeId)
    .select("departmentId");
  if (!employee) {
    throw new Error("Employee not found");
  }

  // 2. Convert the input dates and adjust the end date to include the entire day.
  const startDate = new Date(startDates);
  const endDate = new Date(endDates);
  endDate.setHours(23, 59, 59, 999);

  // Prepare the department filter
  const departmentFilter = Array.isArray(employee.departmentId)
    ? { $in: employee.departmentId }
    : employee.departmentId;

  // 3. Run the aggregate query (sundayModel) and the attendance query concurrently.
  const sundayQuery = sundayModel.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        "department.departmentId": departmentFilter,
      },
    },
    {
      $group: {
        _id: null,
        dates: {
          $push: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
        },
      },
    },
    {
      $project: { _id: 0, dates: 1 },
    },
  ]);

  const attendanceQuery = attendanceModel.find({
    employeeId: employeeId,
    date: { $gte: startDate, $lte: endDate },
    approvalStatus: "approved", // Only approved attendances.
    punchInTime: { $ne: null },
  });

  // Run both queries concurrently.
  const [sundayCount, attendanceRecords] = await Promise.all([
    sundayQuery,
    attendanceQuery,
  ]);

  // 4. Extract existing Sundays from the aggregate query result.
  const existingSundays = sundayCount[0]?.dates || [];

  // 5. Process attendance records:
  //    a. Filter for records that occur on Sundays.
  //    b. Convert each date to a 'YYYY-MM-DD' string.
  const attendanceSundaysDates = attendanceRecords
    .filter((record) => new Date(record.date).getDay() === 0)
    .map((record) => new Date(record.date).toISOString().split("T")[0]);

  // Use a Set for O(1) lookup time.
  const attendanceSundaysSet = new Set(attendanceSundaysDates);

  // 6. Determine if any Sundays from sundayModel are missing in the attendance records.
  const missingSundays = existingSundays.filter(
    (date) => !attendanceSundaysSet.has(date)
  );

  if (missingSundays.length > 0) {
    return 0;
  }

  return attendanceSundaysDates.length;
}

async function getAllEmployeesMonthlyAttendanceTwo(req, res) {
  try {
    const {
      month,
      year,
      date,
      filterType,
      departmentId,
      branchId,
      employementTypeId,
      queryStartDate,
      queryEndDate,
    } = req.query;

    // const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    // const { startDate, endDate } = getMonthDateRange(month, selectedYear);
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentDate = new Date();

    const { startDate, endDate } = getMonthDateRange(
      selectedMonth,
      selectedYear
    );
    const effectiveEndDate =
      selectedYear === currentDate.getFullYear() &&
      selectedMonth === currentDate.getMonth() + 1
        ? currentDate
        : endDate;
    // If 'date' is provided, ensure it's within the specified month

    const holidaysData = await holidayModel.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(queryStartDate),
            $lte: new Date(queryEndDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          dates: { $push: "$date" }, // Collect all holiday dates
          holidayCount: { $sum: 1 }, // Count holidays
        },
      },
      {
        $project: {
          _id: 0,
          dates: 1, // List of holiday dates
          holidayCount: 1, // Total holiday count
        },
      },
    ]);

    let specificDate = null;
    if (date) {
      specificDate = new Date(date);
      if (
        specificDate < startDate ||
        specificDate > endDate ||
        isNaN(specificDate.getTime())
      ) {
        return badRequest(
          res,
          "Invalid date. Ensure the date is within the selected month and year."
        );
      }
    }

    const query = {
      status: "active",
      onboardingStatus: "enrolled",
    };

    if (branchId) {
      query.branchId = branchId;
    }
    if (departmentId) {
      query.departmentId = departmentId;
    }
    if (employementTypeId) {
      query.employementTypeId = employementTypeId;
    }

    // Fetch employees with combined filters
    const employees = await employeeModel
      .find(query)
      .populate("branchId", "_id name punchInTime punchOutTime")
      .populate("roleId", "_id roleName")
      .populate(
        "reportingManagerId",
        "_id employeUniqueId employeName userName"
      )
      .populate("departmentId", "_id name")
      .populate("subDepartmentId", "_id name")
      .populate("secondaryDepartmentId", "_id name")
      .populate("seconSubDepartmentId", "_id name")
      .populate("designationId", "_id name")
      .populate("workLocationId", "_id name")
      .populate("constCenterId", "_id title")
      .populate("employementTypeId", "_id title")
      .populate("employeeTypeId", "_id title")
      .sort({ createdAt: -1 });
    // console.log(employees)
    let totalEmployee = employees.length;
    let totalPunchIn = 0;
    let totalPunchOut = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    const employeeAttendanceData = await Promise.all(
      employees.map(async (employee) => {
        const adjustedEndDate = queryEndDate ? new Date(queryEndDate) : endDate;

        // console.log("adjustedEndDate",adjustedEndDate);

        const attendanceFilter = {
          approvalStatus: "approved",
          employeeId: employee._id,
          date:
            queryStartDate && queryEndDate
              ? {
                  $gte: new Date(queryStartDate),
                  $lte: new Date(adjustedEndDate),
                } // Filter for specific date if provided
              : { $gte: startDate, $lte: endDate }, // Otherwise, filter by month range
        };

        // console.log("attendanceFilter",attendanceFilter);

        const attendanceRecords = await attendanceModel.find(attendanceFilter);

        // console.log("attendanceRecords",attendanceRecords.map((record) => record.date));

        // let presentCount = 0;
        // let sundayPresentCount = 0;

        // attendanceRecords.forEach((record) => {
        //   if (record.punchInTime) presentCount++;
        // });
        let presentCount = 0;
        let totalPresentCount = 0;
        let sundayPresentCount = 0;
        let halfDayTotalCount = 0;
        let halfDayLatePunchInCount = 0;
        let halfDayEarlyPunchOutCount = 0;
        let lateComingCount = 0;
        let earlyGoingCount = 0;
        let noPunchIn = 0;
        let noPunchOut = 0;
        let totalDeduction = 0;
        let finalPresent = 0;
        let holidayPunchIn = 0;
        let sundayWorkingPunchIn = 0;
        let sundayWorkingNotPunchIn = 0;
        // Count days the employee has punched in
        // attendanceRecords.forEach((record) => {
        //   if (record.punchInTime) {
        //     presentCount++;
        //   }

        // });
        const uniquePunchOutEmployees = new Set();
        const uniquePunchInEmployees = new Set();
        attendanceRecords.forEach((record) => {
          // console.log("===",record);
          if (record.punchInTime) {
            const recordPunchInTime = moment(
              record.punchInTime,
              "YYYY-MM-DDTHH:mm:ss A"
            );

            const branchRawPunchInTime = moment(
              employee.branchId.punchInTime,
              "YYYY-MM-DDTHH:mm:ss A"
            ).format("HH:mm:ss"); // Extract branch punch-in time (HH:mm:ss)

            const branchPunchInTime = moment(
              `${recordPunchInTime.format(
                "YYYY-MM-DD"
              )}T${branchRawPunchInTime}`,
              "YYYY-MM-DDTHH:mm:ss"
            ); // Combine record punch-in date with branch punch-in time

            const diffMinutes = recordPunchInTime.diff(
              branchPunchInTime,
              "minutes"
            );

            if (diffMinutes <= 15) {
              // Within branch punch-in time + 15 minutes
              presentCount += 1;
            } else if (diffMinutes > 15 && diffMinutes <= 45) {
              // Between branch punch-in time + 15 and +45 minutes
              presentCount += 1;
              lateComingCount += 1;
            } else if (diffMinutes > 45) {
              // Beyond branch punch-in time + 45 minutes

              const fourHourCutoff = branchPunchInTime.clone().add(4, "hours");

              if (recordPunchInTime.isAfter(fourHourCutoff)) {
                // Punched in after 4 hours from branch punch-in time
                presentCount += 1; // Still mark as present
                lateComingCount += 1; // Count as late
              } else {
                // Late but within 4 hours
                presentCount += 1;
                halfDayLatePunchInCount += 0.5;
                halfDayTotalCount += 0.5;
              }
            }

            //  ------------------ check if punchIn-in time is a holiday ------------------ //

            const changedRecordPunchInTime = new Date(
              new Date(recordPunchInTime).setHours(0, 0, 0, 0)
            );

            const isHoliday = holidaysData.some((holiday) =>
              holiday.dates.some((date) => {
                const holidayDate = new Date(
                  new Date(date).setHours(0, 0, 0, 0)
                );
                return (
                  holidayDate.getTime() === changedRecordPunchInTime.getTime()
                );
              })
            );

            if (isHoliday) {
              presentCount -= holidaysData[0].holidayCount;
              holidayPunchIn += holidaysData[0].holidayCount;
            }

            // --------------------- END --------------------- //
            else {
              noPunchIn += 1;
            }
          }

          if (record.punchOutTime) {
            const punchOutDate = moment(
              record.punchOutTime,
              "YYYY-MM-DDTHH:mm:ss A"
            ); // Parse punch-out time

            const branchRawPunchOutTime = moment(
              employee.branchId.punchOutTime,
              "YYYY-MM-DDTHH:mm:ss A"
            ).format("HH:mm:ss"); // Extract branch punch-out time (HH:mm:ss)

            const branchPunchOutTime = moment(
              `${punchOutDate.format("YYYY-MM-DD")}T${branchRawPunchOutTime}`,
              "YYYY-MM-DDTHH:mm:ss"
            ); // Combine record punch-out date with branch punch-out time

            // Calculate difference in minutes
            const diffMinutes = punchOutDate.diff(
              branchPunchOutTime,
              "minutes"
            );

            // Logic for punch-out before 1 hour from branch punch-out timing: Half day
            if (diffMinutes < -60) {
              halfDayEarlyPunchOutCount += 0.5;
              halfDayTotalCount += 0.5; // Add to total half-day count
            }
            // Logic for punch-out within 1 hour before branch punch-out timing to branch punch-out time: Early leaving
            else if (diffMinutes >= -60 && diffMinutes <= 0) {
              earlyGoingCount += 1; // Add to early leaving count
            }
          } else {
            noPunchOut += 1;
          }
        });

        // const sundaysInMonth = getSundaysInMonth(
        //   selectedMonth,
        //   selectedYear
        // ).filter((sunday) => sunday <= effectiveEndDate);

        const firstParameter = queryStartDate
          ? new Date(queryStartDate)
          : new Date(selectedYear, selectedMonth - 1, 1);
        const secondParameter = queryEndDate
          ? new Date(queryEndDate)
          : new Date(selectedYear, selectedMonth, 0);

        // Get Sundays based on the selected parameters
        const sundaysInMonth = getSundaysInMonth(
          firstParameter,
          secondParameter
        ).filter((sunday) => sunday <= effectiveEndDate);

        // console.log("sundaysInMonth",sundaysInMonth);

        // Count Sundays that are not already present in attendanceRecords
        const sundayDates = sundaysInMonth.map(
          (sunday) => sunday.toISOString().split("T")[0]
        );

        // console.log("sundayDates",sundayDates);

        const presentDates = attendanceRecords.map(
          (record) => record.date.toISOString().split("T")[0]
        );
        // console.log("presentDates",presentDates);
        // sundayPresentCount = sundayDates.filter(
        //   (sunday) => !presentDates.includes(sunday)
        // ).length;
        // console.log("sundayPresentCount",sundayPresentCount);

        // Simply count the Sundays in sundayDates
        sundayPresentCount = sundayDates.length;

        // Add Sundays to present count
        // console.log("presentCount", presentCount);
        // console.log("sundayPresentCount", sundayPresentCount);

        totalPresentCount = presentCount + sundayPresentCount;

        const daysInMonth = new Date(selectedYear, month, 0).getDate();
        const currentDate = new Date();
        const today = currentDate.getDate(); // Get the current day of the month
        const isCurrentMonth =
          currentDate.getMonth() === month - 1 &&
          currentDate.getFullYear() === selectedYear;

        const daysElapsed = isCurrentMonth
          ? today
          : new Date(selectedYear, month, 0).getDate();
        let absentCount =
          queryStartDate && adjustedEndDate
            ? 0
            : daysElapsed - totalPresentCount;
        // const absentCount = specificDate ? 0 : daysInMonth - presentCount;

        const normalizedStartDate = moment(queryStartDate)
          .toISOString()
          .split("T")[0];
        const normalizedEndDate = moment(adjustedEndDate)
          .toISOString()
          .split("T")[0];

        // console.log("normalizedStartDate",normalizedStartDate);
        // console.log("normalizedEndDate",normalizedEndDate);

        const allDatesInRange = getAllDates(
          normalizedStartDate,
          normalizedEndDate
        );
        // console.log("allDatesInRange", allDatesInRange);

        const attendanceMap = {};
        attendanceRecords.forEach((record) => {
          const formattedDate = moment(record.date).format("YYYY-MM-DD");
          attendanceMap[formattedDate] = record;
        });

        const endOfToday = moment().endOf("day"); // Get the end of today (23:59:59)

        // Filter out future dates from allDatesInRange
        const validDates = allDatesInRange.filter((date) =>
          moment(date).isSameOrBefore(endOfToday)
        );

        // Process only validDates
        const dateWiseAttendance = await Promise.all(
          validDates.map(async (date) => {
            const formattedDate = moment(date).format("YYYY-MM-DD");

            // Determine the day of the week (e.g., "Monday", "Tuesday", etc.)
            const dayOfWeek = moment(formattedDate).format("dddd");

            if (attendanceMap[formattedDate]) {
              const record = attendanceMap[formattedDate];
              let workedHours = 0;
              const punchIn = record.punchInTime
                ? moment(record.punchInTime, "YYYY-MM-DDTHH:mm:ss A")
                : null;
              // const punchOut = record.punchOutTime
              //   ? moment(record.punchOutTime, "YYYY-MM-DDTHH:mm:ss A")
              //   : moment(punchIn).hour(15).minute(0).second(0); // Default to 3:00 PM if no punchOut

              const punchOut = record.punchOutTime
                ? moment(record.punchOutTime, "YYYY-MM-DDTHH:mm:ss A")
                : null; // Default to 3:00 PM if no punchOut

              if (
                punchIn &&
                punchOut &&
                punchOut.isValid() &&
                punchIn.isValid()
              ) {
                if (punchOut.isAfter(punchIn)) {
                  const duration = moment.duration(punchOut.diff(punchIn));
                  const hours = Math.floor(duration.asHours()); // Get total hours
                  const minutes = Math.floor(duration.asMinutes() % 60); // Get remaining minutes
                  workedHours = `${hours}h ${minutes}m`; // Format worked hours
                }
              }

              return {
                employeeId: record.employeeId,
                date: moment(date).format("DD MMM YYYY"),
                day: dayOfWeek, // Add day of the week
                status: record.approvalStatus || "Absent", // Approval status (if exists)
                punchInTime: punchIn ? punchIn.format("hh:mm A") : null, // Format punchInTime
                punchOutTime: punchOut ? punchOut.format("hh:mm A") : "", // Format punchOutTime
                location: record.location || "", // Include location if available
                workedHours: workedHours, // Formatted worked hours
                attendance: punchIn ? "P" : "A", // Mark as present if punchIn exists
              };
            }

            // console.log("queryStartDate",queryStartDate);
            // console.log("queryEndDate",queryEndDate);

            // Default response if no attendance for the date
            return {
              date: moment(date).format("DD MMM YYYY"),
              day: dayOfWeek,
              status: "Absent",
              punchInTime: null,
              punchOutTime: "",
              location: "",
              workedHours: "0h 0m",
              attendance: "A",
            };
          })
        );

        // Function to calculate absent days
        const getAbsentDays = (
          queryStartDate,
          queryEndDate,
          dateWiseAttendance
        ) => {
          // console.log("dateWiseAttendance",dateWiseAttendance);

          const start = moment(queryStartDate).startOf("day");
          const end = moment(queryEndDate).endOf("day");

          const absentDays = dateWiseAttendance.filter((attendance) => {
            const attendanceDate = moment(attendance.date, "DD MMM YYYY");

            // Check if the day is not Sunday, status is "Absent", and punchInTime is null
            return (
              attendanceDate.isBetween(start, end, null, "[]") && // Inclusive of start and end dates
              attendance.day !== "Sunday" && // Exclude Sundays
              attendance.punchInTime == null // Check if punchInTime is null
            );
          });

          // console.log("absentDays",absentDays);

          return absentDays.length; // Return the number of absent days excluding Sundays with null punchInTime
        };

        // Calculate absent days
        const absentDays = getAbsentDays(
          queryStartDate,
          queryEndDate,
          dateWiseAttendance
        );
        // const holidaysCount = await holidays(queryStartDate, queryEndDate, dateWiseAttendance);
        // const sundayworkingCount = await sundayWorkCount(queryStartDate, queryEndDate, dateWiseAttendance)
        // const sundayPunchIn  = await sundayconfuction_web(employee._id, queryStartDate, queryEndDate);

        const [
          holidaysCount,
          sundayworkingCount,
          sundayPunchIn,
          loginRecords,
          pdRecords,
        ] = await Promise.all([
          holidays(queryStartDate, queryEndDate, dateWiseAttendance),
          sundayWorkCount(queryStartDate, queryEndDate, dateWiseAttendance),
          sundayconfuction_web(employee._id, queryStartDate, queryEndDate),
          // Get login records (ProcessModel) for the date range
          processModel
            .find({
              salesCompleteDate: { $gte: queryStartDate, $lte: queryEndDate },
              ...(employee._id && { employeId: employee._id }),
            })
            .lean(),

          // Get PD records (ExternalVendorDynamics) for the date range
          externalVendorFormModel
            .find({
              creditPdCompleteDate: {
                $gte: queryStartDate,
                $lte: queryEndDate,
              },
              ...(employee._id && { creditPdId: employee._id }),
            })
            .lean(),
        ]);
        if (sundayPunchIn > 0) {
          sundayWorkingPunchIn += sundayPunchIn;
        }

        // console.log("holidayCount" , holidaysCount)

        const policyData = await policyModel
          .findOne({})
          .sort({ createdAt: 1 })
          .exec();
        // console.log(policyData);
        let halfDay = 0;
        const defaultLateComingAllowed = 3;
        const defaultEarlyGoingAllowed = 3;

        const lateComingAllowed = policyData
          ? policyData.lateComingAllowed
          : defaultLateComingAllowed;
        const earlyGoingAllowed = policyData
          ? policyData.earlyGoingAllowed
          : defaultEarlyGoingAllowed;

        if (lateComingCount > lateComingAllowed) {
          halfDay += lateComingCount - lateComingAllowed;
        }
        if (earlyGoingCount > earlyGoingAllowed) {
          halfDay += earlyGoingCount - earlyGoingAllowed;
        }
        totalDeduction = halfDayTotalCount + halfDay / 2;

        finalPresent = totalPresentCount - totalDeduction;
        if (presentCount > 0) {
          totalPunchIn += 1;
          if (noPunchOut === 0) {
            totalPunchOut += 1;
          }
        }
        if (queryStartDate && adjustedEndDate && filterType === "absent") {
          absentCount = 1;
        }
        //     const useCustomDateRange = !!(queryStartDate && queryEndDate);
        //         const { startDate, endDate } = getMonthDateRange(selectedMonth, selectedYear);
        // const dateStart = useCustomDateRange ? new Date(queryStartDate) : startDate;
        // const dateEnd = useCustomDateRange ? new Date(queryEndDate) : endDate;
        //       // Filter login records by date
        // const filteredLoginRecords = loginRecords.filter(record => {
        //   const recordDate = parseCustomDate(record.salesCompleteDate);
        //   return recordDate && recordDate >= dateStart && recordDate <= dateEnd;
        // });

        // // Filter PD records by date
        // const filteredPdRecords = pdRecords.filter(record => {
        //   const recordDate = parseCustomDate(record.creditPdCompleteDate);
        //   return recordDate && recordDate >= dateStart && recordDate <= dateEnd;
        // });

        // // Create employee login count map
        // const employeeLoginCountMap = {};
        // filteredLoginRecords.forEach(record => {
        //   const empId = record.employeId ? record.employeId.toString() : null;
        //   if (empId) {
        //     employeeLoginCountMap[empId] = (employeeLoginCountMap[empId] || 0) + 1;
        //   }
        // });

        // // Create employee PD count map
        // const employeePdCountMap = {};
        // filteredPdRecords.forEach(record => {
        //   const empId = record.creditPdId ? record.creditPdId.toString() : null;
        //   if (empId) {
        //     employeePdCountMap[empId] = (employeePdCountMap[empId] || 0) + 1;
        //   }
        // });

        const loginCount = loginRecords.length;

        const pdCount = pdRecords.length;
        return {
          _id: employee._id,
          // absentDays: absentDays-holidaysCount,
          absentDays: Math.max(
            absentDays -
              holidaysCount +
              holidayPunchIn +
              sundayworkingCount.sundayWorkingNotPunchIn,
            0
          ),
          holidays: holidaysCount,
          holidayPunchIn: holidayPunchIn,
          SundayWorking: sundayworkingCount.sundayCount,
          sundayWorkingNotPunchIn: sundayworkingCount.sundayWorkingNotPunchIn,
          sundayWorkingPunchIn: sundayWorkingPunchIn,
          presentDays: totalPresentCount, // Total present days including Sundays
          newPresentDays: presentCount - sundayWorkingPunchIn,
          punchCount: presentCount, // Total present days
          sundayPresentCount:
            sundayPresentCount - sundayworkingCount.sundayCount, // Only Sundays counted as present
          halfDayTotalCount: halfDayTotalCount,
          halfDayLatePunchInCount: halfDayLatePunchInCount,
          halfDayEarlyPunchOutCount: halfDayEarlyPunchOutCount,
          lateComingCount: lateComingCount,
          earlyGoingCount: earlyGoingCount,
          noPunchIn: noPunchIn,
          noPunchOut: noPunchOut,
          totalDeduction: totalDeduction,
          finalPresent: finalPresent,
          loginCount: loginCount,
          pdCount: pdCount,
          dateWiseAttendance:
            queryStartDate && adjustedEndDate ? dateWiseAttendance : [],
          employeeDetail: {
            employeUniqueId: employee.employeUniqueId,
            employeName: employee.employeName,
            userName: employee.userName,
            email: employee.email,
            workEmail: employee.workEmail,
            mobileNo: employee.mobileNo,
            joiningDate: employee.joiningDate,
            dateOfBirth: employee.dateOfBirth,
            fatherName: employee.fatherName,
            employeePhoto: employee.employeePhoto,
            currentAddress: employee.currentAddress,
            permanentAddress: employee.permanentAddress,
            location: employee.location,
            status: employee.status,
            branchId: employee.branchId
              ? { name: employee.branchId.name }
              : null,
            roleId: employee.roleId,
            reportingManagerId: employee.reportingManagerId
              ? {
                  employeUniqueId: employee.reportingManagerId.employeUniqueId,
                  employeName: employee.reportingManagerId.employeName,
                  userName: employee.reportingManagerId.userName,
                }
              : null,
            departmentId: employee.departmentId
              ? { name: employee.departmentId.name }
              : null,
            subDepartmentId: employee.subDepartmentId
              ? { name: employee.subDepartmentId.name }
              : null,
            secondaryDepartmentId: employee.secondaryDepartmentId
              ? {
                  name: employee.secondaryDepartmentId.name,
                }
              : null,
            seconSubDepartmentId: employee.seconSubDepartmentId
              ? { name: employee.seconSubDepartmentId.name }
              : null,
            designationId: employee.designationId
              ? { name: employee.designationId.name }
              : null,
            workLocationId: employee.workLocationId
              ? { name: employee.workLocationId.name }
              : null,
            constCenterId: employee.constCenterId
              ? { title: employee.constCenterId.title }
              : null,
            employementTypeId: employee.employementTypeId
              ? { title: employee.employementTypeId.title }
              : null,
            employeeTypeId: employee.employeeTypeId
              ? { title: employee.employeeTypeId.title }
              : null,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
            onboardingStatus: employee.onboardingStatus,
          },
        };
      })
    );

    // Apply filterType for 'present' or 'absent'
    let filteredData = employeeAttendanceData;
    if (filterType === "present") {
      filteredData = filteredData.filter(
        (employee) => employee.punchCount >= 1
      );
      totalPresent = filteredData.length;
      totalAbsent = totalEmployee - totalPresent;
    } else if (filterType === "absent") {
      if (specificDate) {
        filteredData = filteredData.filter(
          (employee) => employee.punchCount === 0 && employee.absentDays === 1
        );
        totalAbsent = filteredData.length;
        totalPresent = totalEmployee - totalAbsent;
      } else {
        // console.log("absent no date");
        filteredData = filteredData.filter(
          (employee) => employee.absentDays > 0
        );
        totalAbsent = filteredData.length;
        totalPresent = totalEmployee - totalAbsent;
      }
    } else if (filterType == "all") {
      console.log("all");
      // When filterType is 'all', show all data (both present and absent)
      totalPresent = filteredData.filter(
        (employee) => employee.punchCount >= 1
      ).length;
      totalAbsent = totalEmployee - totalPresent;
      // No additional filtering is done for 'all', so `filteredData` stays the same
    }

    // console.log(filteredData)

    // if (!specificDate) {
    //   totalPunchIn = "N/A"; // Default to 'N/A'
    //   totalPunchOut = "N/A"; // Default to 'N/A'
    //   totalPresent = "N/A"; // Default to 'N/A'
    //   totalAbsent = "N/A"; // Default to 'N/A'
    // }
    return success(res, "Employees Monthly Attendance List", {
      totalEmployee,
      totalPunchIn,
      totalPunchOut,
      totalPresent,
      totalAbsent,
      filteredData,
    });
  } catch (error) {
    console.error("Error fetching monthly attendance data:", error);
    unknownError(res, error);
  }
}

// Constants for attendance rules
const ATTENDANCE_CONSTANTS = {
  GRACE_PERIOD_MINUTES: 15,
  LATE_THRESHOLD_MINUTES: 45,
  HALF_DAY_HOURS: 4,
  DEFAULT_LATE_COMING_ALLOWED: 3,
  DEFAULT_EARLY_GOING_ALLOWED: 3,
};

/**
 * Get holiday data for a date range
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Array>} Holiday data
 */
async function getHolidayData(startDate, endDate) {
  return await holidayModel.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        holidayCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        dates: 1,
        holidayCount: 1,
      },
    },
  ]);
}

/**
 * Get all dates between start and end dates
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {Array} Array of all dates in range
 */
function getAllDates(startDate, endDate) {
  const dates = [];
  let currentDate = moment(startDate);
  const lastDate = moment(endDate);

  while (currentDate.isSameOrBefore(lastDate)) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "days");
  }

  return dates;
}

/**
 * Process attendance records for a specific employee
 * @param {Object} employee - Employee document
 * @param {Array} attendanceRecords - Employee's attendance records
 * @param {Object} dateRange - Start and end dates
 * @param {Array} holidaysData - Holiday information
 * @param {Object} policyData - Attendance policy data
 * @returns {Promise<Object>} Processed attendance data
 */
async function processEmployeeAttendance(
  employee,
  attendanceRecords,
  dateRange,
  holidaysData,
  policyData,
  employeeLeaveData
) {
  const { queryStartDate, queryEndDate, startDate, endDate, effectiveEndDate } =
    dateRange;

  // Initialize counters
  let presentCount = 0;
  let totalPresentCount = 0;
  let sundayPresentCount = 0;
  let halfDayTotalCount = 0;
  let halfDayLatePunchInCount = 0;
  let halfDayEarlyPunchOutCount = 0;
  let lateComingCount = 0;
  let earlyGoingCount = 0;
  let noPunchIn = 0;
  let noPunchOut = 0;
  let holidayPunchIn = 0;
  let sundayWorkingPunchIn = 0;
  let sundayWorkingNotPunchIn = 0;

  // Process punch-in/out records
  const uniquePunchOutEmployees = new Set();
  const uniquePunchInEmployees = new Set();

  attendanceRecords.forEach((record) => {
    // Process punch-in time
    if (record.punchInTime) {
      const recordPunchInTime = moment(
        record.punchInTime,
        "YYYY-MM-DDTHH:mm:ss A"
      );
      const branchRawPunchInTime = moment(
        employee.branchId.punchInTime,
        "YYYY-MM-DDTHH:mm:ss A"
      ).format("HH:mm:ss");
      const branchPunchInTime = moment(
        `${recordPunchInTime.format("YYYY-MM-DD")}T${branchRawPunchInTime}`,
        "YYYY-MM-DDTHH:mm:ss"
      );

      const diffMinutes = recordPunchInTime.diff(branchPunchInTime, "minutes");

      // Apply attendance rules based on punch-in time
      if (diffMinutes <= ATTENDANCE_CONSTANTS.GRACE_PERIOD_MINUTES) {
        // On time (within grace period)
        presentCount += 1;
      } else if (
        diffMinutes > ATTENDANCE_CONSTANTS.GRACE_PERIOD_MINUTES &&
        diffMinutes <= ATTENDANCE_CONSTANTS.LATE_THRESHOLD_MINUTES
      ) {
        // Late, but within threshold
        presentCount += 1;
        lateComingCount += 1;
      } else if (diffMinutes > ATTENDANCE_CONSTANTS.LATE_THRESHOLD_MINUTES) {
        // Very late
        const fourHourCutoff = branchPunchInTime
          .clone()
          .add(ATTENDANCE_CONSTANTS.HALF_DAY_HOURS, "hours");

        if (recordPunchInTime.isAfter(fourHourCutoff)) {
          // Punched in after 4 hours from branch punch-in time
          presentCount += 1;
          lateComingCount += 1;
        } else {
          // Late but within 4 hours - half day
          presentCount += 1;
          halfDayLatePunchInCount += 0.5;
          halfDayTotalCount += 0.5;
        }
      }

      // Check if punch-in day is a holiday
      const changedRecordPunchInTime = new Date(
        new Date(recordPunchInTime).setHours(0, 0, 0, 0)
      );

      const isHoliday =
        holidaysData.length > 0 &&
        holidaysData[0].dates.some((date) => {
          const holidayDate = new Date(new Date(date).setHours(0, 0, 0, 0));
          return holidayDate.getTime() === changedRecordPunchInTime.getTime();
        });

      if (isHoliday) {
        presentCount -= holidaysData[0].holidayCount;
        holidayPunchIn += holidaysData[0].holidayCount;
      } else {
        noPunchIn += 1;
      }
    }

    // Process punch-out time
    if (record.punchOutTime) {
      const punchOutDate = moment(record.punchOutTime, "YYYY-MM-DDTHH:mm:ss A");
      const branchRawPunchOutTime = moment(
        employee.branchId.punchOutTime,
        "YYYY-MM-DDTHH:mm:ss A"
      ).format("HH:mm:ss");
      const branchPunchOutTime = moment(
        `${punchOutDate.format("YYYY-MM-DD")}T${branchRawPunchOutTime}`,
        "YYYY-MM-DDTHH:mm:ss"
      );

      // Calculate difference in minutes
      const diffMinutes = punchOutDate.diff(branchPunchOutTime, "minutes");

      // Logic for early departures
      if (diffMinutes < -60) {
        // More than 1 hour early - half day
        halfDayEarlyPunchOutCount += 0.5;
        halfDayTotalCount += 0.5;
      } else if (diffMinutes >= -60 && diffMinutes <= 0) {
        // Within 1 hour early - early going
        earlyGoingCount += 1;
      }
    } else {
      noPunchOut += 1;
    }
  });

  // Get Sundays in the date range
  const firstParameter = queryStartDate
    ? new Date(queryStartDate)
    : new Date(dateRange.selectedYear, dateRange.selectedMonth - 1, 1);
  const secondParameter = queryEndDate
    ? new Date(queryEndDate)
    : new Date(dateRange.selectedYear, dateRange.selectedMonth, 0);

  const sundaysInMonth = getSundaysInMonth(
    firstParameter,
    secondParameter
  ).filter((sunday) => sunday <= effectiveEndDate);

  // Get Sunday dates as strings
  const sundayDates = sundaysInMonth.map(
    (sunday) => sunday.toISOString().split("T")[0]
  );

  // Count Sundays
  sundayPresentCount = sundayDates.length;

  // Calculate total present count
  totalPresentCount = presentCount + sundayPresentCount;

  // Process date-wise attendance
  const normalizedStartDate = moment(queryStartDate)
    .toISOString()
    .split("T")[0];
  const normalizedEndDate = moment(queryEndDate || endDate)
    .toISOString()
    .split("T")[0];
  const allDatesInRange = getAllDates(normalizedStartDate, normalizedEndDate);

  // Create map of attendance records by date
  const attendanceMap = {};
  attendanceRecords.forEach((record) => {
    const formattedDate = moment(record.date).format("YYYY-MM-DD");
    attendanceMap[formattedDate] = record;
  });

  // Filter out future dates
  const endOfToday = moment().endOf("day");
  const validDates = allDatesInRange.filter((date) =>
    moment(date).isSameOrBefore(endOfToday)
  );

  // Create date-wise attendance details
  const dateWiseAttendance = await Promise.all(
    validDates.map(async (date) => {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const dayOfWeek = moment(formattedDate).format("dddd");
      const momentDate = moment(date);

      // Check if this date falls within an approved leave period
      const isLeaveDay =
        employeeLeaveData &&
        employeeLeaveData.leaveDetails.some((leave) => {
          const leaveStart = moment(leave.startDate, "DD MMM YYYY");
          const leaveEnd = moment(leave.endDate, "DD MMM YYYY");
          return momentDate.isBetween(leaveStart, leaveEnd, null, "[]"); // Include start and end dates
        });

      // If it's a leave day, return leave status regardless of attendance
      if (isLeaveDay) {
        return {
          date: moment(date).format("DD MMM YYYY"),
          day: dayOfWeek,
          status: "Leave",
          punchInTime: null,
          punchOutTime: "",
          location: "",
          workedHours: "0h 0m",
          attendance: "L",
        };
      }

      if (attendanceMap[formattedDate]) {
        const record = attendanceMap[formattedDate];
        let workedHours = 0;
        const punchIn = record.punchInTime
          ? moment(record.punchInTime, "YYYY-MM-DDTHH:mm:ss A")
          : null;
        const punchOut = record.punchOutTime
          ? moment(record.punchOutTime, "YYYY-MM-DDTHH:mm:ss A")
          : null;

        // Calculate worked hours
        if (punchIn && punchOut && punchOut.isValid() && punchIn.isValid()) {
          if (punchOut.isAfter(punchIn)) {
            const duration = moment.duration(punchOut.diff(punchIn));
            const hours = Math.floor(duration.asHours());
            const minutes = Math.floor(duration.asMinutes() % 60);
            workedHours = `${hours}h ${minutes}m`;
          }
        }

        return {
          employeeId: record.employeeId,
          date: moment(date).format("DD MMM YYYY"),
          day: dayOfWeek,
          status: record.approvalStatus || "Absent",
          punchInTime: punchIn ? punchIn.format("hh:mm A") : null,
          punchOutTime: punchOut ? punchOut.format("hh:mm A") : "",
          location: record.location || "",
          workedHours: workedHours,
          attendance: punchIn ? "P" : "A",
        };
      }

      // Default for dates with no attendance record
      return {
        date: moment(date).format("DD MMM YYYY"),
        day: dayOfWeek,
        status: "Absent",
        punchInTime: null,
        punchOutTime: "",
        location: "",
        workedHours: "0h 0m",
        attendance: "A",
      };
    })
  );

  // Calculate absent days (excluding Sundays and holidays)
  const absentDays = getAbsentDays(
    queryStartDate,
    queryEndDate,
    dateWiseAttendance
  );

  // Fetch additional data in parallel
  const [
    holidaysCount,
    sundayworkingCount,
    sundayPunchIn,
    loginRecords,
    pdRecords,
  ] = await Promise.all([
    holidays(queryStartDate, queryEndDate, dateWiseAttendance),
    sundayWorkCount(queryStartDate, queryEndDate, dateWiseAttendance),
    sundayconfuction_web(employee._id, queryStartDate, queryEndDate),
    processModel
      .find({
        salesCompleteDate: { $gte: queryStartDate, $lte: queryEndDate },
        ...(employee._id && { employeId: employee._id }),
      })
      .lean(),
    externalVendorFormModel
      .find({
        creditPdCompleteDate: { $gte: queryStartDate, $lte: queryEndDate },
        ...(employee._id && { creditPdId: employee._id }),
      })
      .lean(),
  ]);

  if (sundayPunchIn > 0) {
    sundayWorkingPunchIn += sundayPunchIn;
  }

  // Apply attendance policy rules
  let halfDay = 0;
  const lateComingAllowed = policyData
    ? policyData.lateComingAllowed
    : ATTENDANCE_CONSTANTS.DEFAULT_LATE_COMING_ALLOWED;
  const earlyGoingAllowed = policyData
    ? policyData.earlyGoingAllowed
    : ATTENDANCE_CONSTANTS.DEFAULT_EARLY_GOING_ALLOWED;

  if (lateComingCount > lateComingAllowed) {
    halfDay += lateComingCount - lateComingAllowed;
  }
  if (earlyGoingCount > earlyGoingAllowed) {
    halfDay += earlyGoingCount - earlyGoingAllowed;
  }

  const totalDeduction = halfDayTotalCount + halfDay / 2;
  const finalPresent = totalPresentCount - totalDeduction;

  // Prepare and return employee attendance data
  return {
    _id: employee._id,
    absentDays: Math.max(
      absentDays -
        holidaysCount +
        holidayPunchIn +
        sundayworkingCount.sundayWorkingNotPunchIn -
        employeeLeaveData.totalLeaveDays,
      0
    ),
    holidays: holidaysCount,
    holidayPunchIn: holidayPunchIn,
    SundayWorking: sundayworkingCount.sundayCount,
    sundayWorkingNotPunchIn: sundayworkingCount.sundayWorkingNotPunchIn,
    sundayWorkingPunchIn: sundayWorkingPunchIn,
    presentDays: totalPresentCount,
    newPresentDays: presentCount - sundayWorkingPunchIn,
    punchCount: presentCount,
    sundayPresentCount: sundayPresentCount - sundayworkingCount.sundayCount,
    halfDayTotalCount: halfDayTotalCount,
    halfDayLatePunchInCount: halfDayLatePunchInCount,
    halfDayEarlyPunchOutCount: halfDayEarlyPunchOutCount,
    lateComingCount: lateComingCount,
    earlyGoingCount: earlyGoingCount,
    noPunchIn: noPunchIn,
    noPunchOut: noPunchOut,
    totalDeduction: totalDeduction,
    finalPresent: finalPresent,
    loginCount: loginRecords.length,
    pdCount: pdRecords.length,
    dateWiseAttendance:
      queryStartDate && queryEndDate ? dateWiseAttendance : [],
    employeeDetail: formatEmployeeDetails(employee),
  };
}

/**
 * Format employee details for response
 * @param {Object} employee - Employee document
 * @returns {Object} Formatted employee details
 */
function formatEmployeeDetails(employee) {
  return {
    employeUniqueId: employee.employeUniqueId,
    employeName: employee.employeName,
    userName: employee.userName,
    email: employee.email,
    workEmail: employee.workEmail,
    mobileNo: employee.mobileNo,
    joiningDate: employee.joiningDate,
    dateOfBirth: employee.dateOfBirth,
    fatherName: employee.fatherName,
    employeePhoto: employee.employeePhoto,
    currentAddress: employee.currentAddress,
    permanentAddress: employee.permanentAddress,
    location: employee.location,
    status: employee.status,
    branchId: employee.branchId ? { name: employee.branchId.name } : null,
    roleId: employee.roleId,
    reportingManagerId: employee.reportingManagerId
      ? {
          employeUniqueId: employee.reportingManagerId.employeUniqueId,
          employeName: employee.reportingManagerId.employeName,
          userName: employee.reportingManagerId.userName,
        }
      : null,
    departmentId: employee.departmentId
      ? { name: employee.departmentId.name }
      : null,
    subDepartmentId: employee.subDepartmentId
      ? { name: employee.subDepartmentId.name }
      : null,
    secondaryDepartmentId: employee.secondaryDepartmentId
      ? { name: employee.secondaryDepartmentId.name }
      : null,
    seconSubDepartmentId: employee.seconSubDepartmentId
      ? { name: employee.seconSubDepartmentId.name }
      : null,
    designationId: employee.designationId
      ? { name: employee.designationId.name }
      : null,
    workLocationId: employee.workLocationId
      ? { name: employee.workLocationId.name }
      : null,
    constCenterId: employee.constCenterId
      ? { title: employee.constCenterId.title }
      : null,
    employementTypeId: employee.employementTypeId
      ? { title: employee.employementTypeId.title }
      : null,
    employeeTypeId: employee.employeeTypeId
      ? { title: employee.employeeTypeId.title }
      : null,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
    onboardingStatus: employee.onboardingStatus,
  };
}

/**
 * Get absent days for an employee (excluding Sundays and holidays)
 * @param {string} startDate
 * @param {string} endDate
 * @param {Array} dateWiseAttendance
 * @returns {number} Number of absent days
 */
function getAbsentDays(startDate, endDate, dateWiseAttendance) {
  const start = moment(startDate).startOf("day");
  const end = moment(endDate).endOf("day");

  const absentDays = dateWiseAttendance.filter((attendance) => {
    const attendanceDate = moment(attendance.date, "DD MMM YYYY");

    return (
      attendanceDate.isBetween(start, end, null, "[]") &&
      attendance.day !== "Sunday" &&
      attendance.punchInTime === null
    );
  });

  return absentDays.length;
}

/**
 * Get approved leaves for employees within a date range
 * @param {Array} employeeIds - Array of employee IDs
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Map of employee IDs to their leave data
 */
async function getEmployeeLeaves(employeeIds, startDate, endDate) {
  // Find all approved leaves that overlap with the given date range
  const leaves = await employeeLeaveModel
    .find({
      employeeId: { $in: employeeIds },
      approvalByReportingManager: "yes", // Only count approved leaves
      status: "active",
      // Leave period overlaps with the query period
      $or: [
        // Leave starts within the period
        { startDate: { $gte: startDate, $lte: endDate } },
        // Leave ends within the period
        { endDate: { $gte: startDate, $lte: endDate } },
        // Leave spans the entire period
        {
          $and: [
            { startDate: { $lte: startDate } },
            { endDate: { $gte: endDate } },
          ],
        },
      ],
    })
    .populate("leaveType", "title");

  // Group leaves by employee ID and calculate days
  const leavesByEmployee = {};

  leaves.forEach((leave) => {
    const empId = leave.employeeId.toString();
    if (!leavesByEmployee[empId]) {
      leavesByEmployee[empId] = {
        totalLeaveDays: 0,
        leaveDetails: [],
      };
    }

    // Calculate actual leave days within the period
    const leaveStart = moment.max(moment(leave.startDate), moment(startDate));
    const leaveEnd = moment.min(moment(leave.endDate), moment(endDate));
    const leaveDays = leaveEnd.diff(leaveStart, "days") + 1; // Include both start and end days

    // Add leave details
    leavesByEmployee[empId].leaveDetails.push({
      leaveId: leave._id,
      startDate: moment(leave.startDate).format("DD MMM YYYY"),
      endDate: moment(leave.endDate).format("DD MMM YYYY"),
      reason: leave.reasonForLeave,
      leaveType: leave.leaveType ? leave.leaveType.title : leave.title,
      days: leaveDays,
    });

    // Update total leave days
    leavesByEmployee[empId].totalLeaveDays += leaveDays;
  });

  return leavesByEmployee;
}

/**
 * Main function to get all employees' monthly attendance data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with attendance data
 */
async function getAllEmployeesMonthlyAttendance(req, res) {
  try {
    // 1. Extract and validate query parameters
    let {
      month,
      year,
      date,
      filterType,
      departmentId,
      branchId,
      employementTypeId,
      queryStartDate,
      queryEndDate,
      status:employeeStatus
    } = req.query;

    if (!employeeStatus){
      employeeStatus = "active"
    }

    // Input validation
    if (
      month &&
      (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)
    ) {
      return badRequest(res, "Invalid month parameter. Must be between 1-12.");
    }

    if (
      year &&
      (isNaN(parseInt(year)) || parseInt(year) < 1900 || parseInt(year) > 2100)
    ) {
      return badRequest(res, "Invalid year parameter.");
    }

    // 2. Calculate date ranges
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const selectedMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentDate = new Date();

    const { startDate, endDate } = getMonthDateRange(
      selectedMonth,
      selectedYear
    );
    const effectiveEndDate =
      selectedYear === currentDate.getFullYear() &&
      selectedMonth === currentDate.getMonth() + 1
        ? currentDate
        : endDate;

    // 3. Verify specific date if provided
    let specificDate = null;
    if (date) {
      specificDate = new Date(date);
      if (
        specificDate < startDate ||
        specificDate > endDate ||
        isNaN(specificDate.getTime())
      ) {
        return badRequest(
          res,
          "Invalid date. Ensure the date is within the selected month and year."
        );
      }
    }

    // 4. Get holiday data for the date range
    const holidaysData = await getHolidayData(
      queryStartDate || startDate,
      queryEndDate || endDate
    );

    // 5. Build employee query
    const query = {
      status: employeeStatus,
      onboardingStatus: "enrolled",
    };

    if (branchId) query.branchId = branchId;
    if (departmentId) query.departmentId = departmentId;
    if (employementTypeId) query.employementTypeId = employementTypeId;

    // 6. Fetch employees with combined filters
    const employees = await employeeModel
      .find(query)
      .populate("branchId", "_id name punchInTime punchOutTime")
      .populate("roleId", "_id roleName")
      .populate(
        "reportingManagerId",
        "_id employeUniqueId employeName userName"
      )
      .populate("departmentId", "_id name")
      .populate("subDepartmentId", "_id name")
      .populate("secondaryDepartmentId", "_id name")
      .populate("seconSubDepartmentId", "_id name")
      .populate("designationId", "_id name")
      .populate("workLocationId", "_id name")
      .populate("constCenterId", "_id title")
      .populate("employementTypeId", "_id title")
      .populate("employeeTypeId", "_id title")
      .sort({ createdAt: -1 });

    const totalEmployee = employees.length;

    // 7. Get attendance policy
    const policyData = await policyModel
      .findOne({})
      .sort({ createdAt: 1 })
      .exec();

    // 8. Prepare date range for attendance queries
    const dateRange = {
      startDate,
      endDate,
      effectiveEndDate,
      selectedYear,
      selectedMonth,
      queryStartDate,
      queryEndDate: queryEndDate || endDate,
    };

    // 9. Process employee data with batch optimization
    // Get all attendance records for all employees in one query
    const employeeIds = employees.map((emp) => emp._id);
    const attendanceFilter = {
      approvalStatus: "approved",
      employeeId: { $in: employeeIds },
      date:
        queryStartDate && queryEndDate
          ? {
              $gte: new Date(queryStartDate),
              $lte: new Date(queryEndDate || endDate),
            }
          : { $gte: startDate, $lte: endDate },
    };

    // Fetch all attendance records and leave records in parallel
    const [allAttendanceRecords, employeeLeaves] = await Promise.all([
      attendanceModel.find(attendanceFilter),
      getEmployeeLeaves(
        employeeIds,
        new Date(queryStartDate || startDate),
        new Date(queryEndDate || endDate)
      ),
    ]);

    // Group attendance records by employee ID
    const attendanceByEmployee = allAttendanceRecords.reduce((acc, record) => {
      const empId = record.employeeId.toString();
      if (!acc[empId]) acc[empId] = [];
      acc[empId].push(record);
      return acc;
    }, {});

    // 10. Process each employee's attendance data
    const employeeAttendanceData = await Promise.all(
      employees.map(async (employee) => {
        const empId = employee._id.toString();
        const employeeAttendance = attendanceByEmployee[empId] || [];
        const employeeLeaveData = employeeLeaves[empId] || {
          totalLeaveDays: 0,
          leaveDetails: [],
        };

        // Process attendance data
        const attendanceData = await processEmployeeAttendance(
          employee,
          employeeAttendance,
          dateRange,
          holidaysData,
          policyData,
          employeeLeaveData
        );

        // Add leave information to the attendance data
        return {
          ...attendanceData,
          leave: {
            totalLeaveDays: employeeLeaveData.totalLeaveDays,
            leaveDetails: employeeLeaveData.leaveDetails,
          },
        };
      })
    );

    // 11. Apply filter based on filterType
    let filteredData = employeeAttendanceData;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalPunchIn = 0;
    let totalPunchOut = 0;
    let totalOnLeave = 0;

    // Count employees with at least one punch-in and leaves
    employees.forEach((emp) => {
      const empData = employeeAttendanceData.find(
        (data) => data._id.toString() === emp._id.toString()
      );
      if (empData) {
        if (empData.punchCount > 0) {
          totalPunchIn++;
          if (empData.noPunchOut === 0) {
            totalPunchOut++;
          }
        }

        if (empData.leave && empData.leave.totalLeaveDays > 0) {
          totalOnLeave++;
        }
      }
    });

    if (filterType === "present") {
      filteredData = filteredData.filter(
        (employee) => employee.punchCount >= 1
      );
      totalPresent = filteredData.length;
      totalAbsent = totalEmployee - totalPresent;
    } else if (filterType === "absent") {
      if (specificDate) {
        filteredData = filteredData.filter(
          (employee) => employee.punchCount === 0 && employee.absentDays === 1
        );
      } else {
        filteredData = filteredData.filter(
          (employee) => employee.absentDays > 0
        );
      }
      totalAbsent = filteredData.length;
      totalPresent = totalEmployee - totalAbsent;
    } else if (filterType === "leave") {
      filteredData = filteredData.filter(
        (employee) => employee.leave && employee.leave.totalLeaveDays > 0
      );
    } else {
      // filterType === "all" or undefined
      totalPresent = employeeAttendanceData.filter(
        (employee) => employee.punchCount >= 1
      ).length;
      totalAbsent = totalEmployee - totalPresent;
    }
    totalAbsent = totalAbsent - totalOnLeave;
    // 12. Return success response
    return success(res, "Employees Monthly Attendance List", {
      totalEmployee,
      totalPunchIn,
      totalPunchOut,
      totalPresent,
      totalAbsent,
      totalOnLeave,
      filteredData,
    });
  } catch (error) {
    console.error("Error fetching monthly attendance data:", error);
    return unknownError(res, error);
  }
}

const parseCustomDate = (dateString) => {
  if (!dateString || dateString === "") return null;

  try {
    // Remove the "T" and handle AM/PM format
    const [datePart, timePart] = dateString.split("T");

    // Check if timePart contains AM/PM
    if (timePart.includes(" ")) {
      const [timeValue, meridiem] = timePart.split(" ");
      const [hours, minutes, seconds] = timeValue.split(":").map(Number);

      const date = new Date(datePart);
      let hour = hours;

      // Convert to 24-hour format if needed
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;

      date.setHours(hour, minutes, seconds || 0);
      return date;
    } else {
      // If no AM/PM, assume it's in 24-hour format
      return new Date(dateString);
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

// Helper function to get the start and end dates of a given month and year

function getMonthDateRange(month, year = new Date().getFullYear()) {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0));
  endDate.setUTCHours(23, 59, 59, 999);

  console.log("startDate:", startDate);
  console.log("endDate:", endDate);

  return { startDate, endDate };
}

function getSundaysInRange(startDate, endDate) {
  const sundays = [];
  const currentDate = new Date(startDate);

  // Set to first Sunday
  currentDate.setDate(currentDate.getDate() + ((7 - currentDate.getDay()) % 7));

  // Collect all Sundays
  while (currentDate <= endDate) {
    sundays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return sundays;
}

// Get all dates between two dates (inclusive)
function getAllDatesBetween(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);

  // Set time to midnight to avoid time comparison issues
  currentDate.setHours(0, 0, 0, 0);
  const endDateTime = new Date(endDate);
  endDateTime.setHours(0, 0, 0, 0);

  // Add each date to array
  while (currentDate <= endDateTime) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Get branch punch-in time (formatted for comparison)
function getBranchPunchInTime(recordTime, branch) {
  if (!branch || !branch.punchInTime) {
    // Default to 9:00 AM if no branch punch time
    return moment(recordTime.format("YYYY-MM-DD") + "T09:00:00");
  }

  const branchRawTime = moment(branch.punchInTime).format("HH:mm:ss");
  return moment(`${recordTime.format("YYYY-MM-DD")}T${branchRawTime}`);
}

// Get branch punch-out time (formatted for comparison)
function getBranchPunchOutTime(recordTime, branch) {
  if (!branch || !branch.punchOutTime) {
    // Default to 6:00 PM if no branch punch time
    return moment(recordTime.format("YYYY-MM-DD") + "T18:00:00");
  }

  const branchRawTime = moment(branch.punchOutTime).format("HH:mm:ss");
  return moment(`${recordTime.format("YYYY-MM-DD")}T${branchRawTime}`);
}

// Calculate absent days efficiently
function calculateAbsentDays(allDates, punchInDates, holidaySet, sundaySet) {
  let absentCount = 0;

  allDates.forEach((date) => {
    const dateStr = date.toISOString().split("T")[0];

    // A day is absent if it's not a holiday, not a Sunday, and has no punch-in
    if (
      !holidaySet.has(dateStr) &&
      !sundaySet.has(dateStr) &&
      !punchInDates.has(dateStr)
    ) {
      absentCount++;
    }
  });

  return absentCount;
}

// Get month date range
function getMonthDateRange(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return { startDate, endDate };
}

// Generate date-wise attendance
function generateEfficientDateWiseAttendance(
  allDates,
  attendanceRecords,
  employee,
  punchInDates,
  punchOutDates,
  holidaySet,
  sundaySet
) {
  // Create a map for faster attendance record lookup
  const attendanceMap = {};
  attendanceRecords.forEach((record) => {
    const dateStr = new Date(record.date).toISOString().split("T")[0];
    attendanceMap[dateStr] = record;
  });

  // Process each date
  return allDates.map((date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);

    // Check if we have an attendance record for this date
    if (attendanceMap[dateStr]) {
      const record = attendanceMap[dateStr];
      let workedHours = "0h 0m";

      const punchIn = record.punchInTime ? moment(record.punchInTime) : null;
      const punchOut = record.punchOutTime ? moment(record.punchOutTime) : null;

      // Calculate worked hours if both punch-in and punch-out exist
      if (
        punchIn &&
        punchOut &&
        punchOut.isValid() &&
        punchIn.isValid() &&
        punchOut.isAfter(punchIn)
      ) {
        const duration = moment.duration(punchOut.diff(punchIn));
        const hours = Math.floor(duration.asHours());
        const minutes = Math.floor(duration.asMinutes() % 60);
        workedHours = `${hours}h ${minutes}m`;
      }

      return {
        date: moment(date).format("DD MMM YYYY"),
        day: dayOfWeek,
        status: record.approvalStatus || "Absent",
        punchInTime: punchIn ? punchIn.format("hh:mm A") : null,
        punchOutTime: punchOut ? punchOut.format("hh:mm A") : "",
        location: record.location || "",
        workedHours,
        attendance: punchIn ? "P" : "A",
      };
    }

    // Default response for days without attendance records
    return {
      date: moment(date).format("DD MMM YYYY"),
      day: dayOfWeek,
      status: "Absent",
      punchInTime: null,
      punchOutTime: "",
      location: "",
      workedHours: "0h 0m",
      attendance: "A",
    };
  });
}

//----------------------------------policy add------------------------------------------------------
function convertToISOFormat(timeStr, dateStr) {
  const [time, period] = timeStr.split(" "); // Split "10:00 am" into time and period
  let [hours, minutes] = time.split(":").map(Number); // Split hours and minutes
  const dateParts = dateStr.split("T")[0]; // Extract the date part from ISO format date

  // Adjust hours based on AM/PM
  if (period.toLowerCase() === "pm" && hours < 12) hours += 0;
  if (period.toLowerCase() === "am" && hours === 12) hours = 0;

  // Build ISO format date string
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${dateParts}T${formattedHours}:${formattedMinutes}:00 ${period.toUpperCase()}`;
}

async function policyAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const policyDetails = await policyModel.create(req.body);
    success(res, "Policy Added Successful", policyDetails);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

const deleteDuplicatesByDate = async (req, res) => {
  try {
    const duplicates = await attendanceModel.aggregate([
      {
        $addFields: {
          punchInDate: {
            $substr: ["$punchInTime", 0, 10],
          },
        },
      },

      {
        $group: {
          _id: {
            date: "$punchInDate",
            employeeId: "$employeeId",
            punchInTime: "$punchInTime",
          },
          docs: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },

      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    const idsToDelete = [];
    duplicates.forEach((duplicate) => {
      idsToDelete.push(...duplicate.docs.slice(1));
    });

    if (idsToDelete.length > 0) {
      const deleteResult = await attendanceModel.deleteMany({
        _id: { $in: idsToDelete },
      });
      return res.status(200).json({
        message: `${deleteResult.deletedCount} duplicate entries removed.`,
        deletedCount: deleteResult.deletedCount,
      });
    } else {
      return res.status(200).json({ message: "No duplicates found." });
    }
  } catch (error) {
    console.error("Error deleting duplicates:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

async function lastWeekAttendence(req, res) {
  try {
    const { employeeId } = req.query;

    const today = moment();
    const lastMonday = moment(today)
      .startOf("week")
      .subtract(1, "week")
      .add(1, "day")
      .toDate();
    const lastSaturday = moment(lastMonday).add(5, "days").toDate();

    const attendances = await attendanceModel.find({
      employeeId,
      date: { $gte: lastMonday, $lte: lastSaturday },
    });

    const response = [];
    for (let day = 0; day < 6; day++) {
      const currentDate = moment(lastMonday)
        .add(day, "days")
        .format("YYYY-MM-DD");

      const dayAttendance = attendances.filter((attendance) =>
        moment(attendance.date).isSame(currentDate, "day")
      );

      if (dayAttendance.length > 0) {
        dayAttendance.forEach((record) => {
          const punchInTime = moment(
            record.punchInTime,
            "YYYY-MM-DDTHH:mm:ss A"
          );
          const punchOutTime = record.punchOutTime
            ? moment(record.punchOutTime, "YYYY-MM-DDTHH:mm:ss A")
            : null;

          let workedHours = "0h 0m";
          if (punchOutTime && punchOutTime.isValid()) {
            const duration = moment.duration(punchOutTime.diff(punchInTime));
            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            workedHours = `${hours}h ${minutes}m`;
          }

          response.push({
            // employeeId: record.employeeId,
            date: moment(record.date).format("DD MMM YYYY"),
            day: moment(record.date).format("dddd"),
            status: record.approvalStatus,
            punchIn: punchInTime.format("hh:mm A"),
            punchOut: punchOutTime ? punchOutTime.format("hh:mm A") : null,
            workedHours,
            attendance: "P",
          });
        });
      } else {
        response.push({
          date: moment(currentDate).format("DD MMM YYYY"),
          day: moment(currentDate).format("dddd"),
          status: "A",
          punchIn: "",
          punchOut: "",
          workedHours: "0h 0m",
          attendance: "A",
        });
      }
    }

    success(res, "Last week's attendance retrieved successfully", response);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function attandaceAcccToDate(req, res) {
  try {
    const { employeeId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required." });
    }

    const start = moment(startDate, "YYYY-MM-DD").startOf("day");
    const end = moment(endDate, "YYYY-MM-DD").endOf("day");

    if (!start.isValid() || !end.isValid()) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const attendances = await attendanceModel.find({
      employeeId,
      date: { $gte: start.toDate(), $lte: end.toDate() },
      approvalStatus: "approved",
    });

    const response = [];
    const totalDays = end.diff(start, "days") + 1;

    for (let day = 0; day < totalDays; day++) {
      const currentDate = moment(start).add(day, "days");
      const dayOfWeek = currentDate.isoWeekday();

      if (dayOfWeek === 7) continue;

      const formattedDate = currentDate.format("YYYY-MM-DD");
      const dayAttendance = attendances.filter((attendance) =>
        moment(attendance.date).isSame(formattedDate, "day")
      );

      if (dayAttendance.length > 0) {
        dayAttendance.forEach((record) => {
          const punchInTime = moment(
            record.punchInTime,
            "YYYY-MM-DDTHH:mm:ss A"
          );
          const punchOutTime = record.punchOutTime
            ? moment(record.punchOutTime, "YYYY-MM-DDTHH:mm:ss A")
            : null;

          let workedHours = "0h 0m";
          if (punchOutTime && punchOutTime.isValid()) {
            const duration = moment.duration(punchOutTime.diff(punchInTime));
            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            workedHours = `${hours}h ${minutes}m`;
          }

          response.push({
            date: currentDate.format("DD MMM YYYY"), // e.g., 14 Jan 2025
            day: currentDate.format("dddd"), // e.g., Monday
            status: record.approvalStatus,
            punchIn: punchInTime.format("hh:mm A"), // 12-hour format
            punchOut: punchOutTime ? punchOutTime.format("hh:mm A") : null, // 12-hour format
            workedHours,
            attendance: "P",
          });
        });
      } else {
        response.push({
          date: currentDate.format("DD MMM YYYY"),
          day: currentDate.format("dddd"),
          status: "A",
          punchIn: "",
          punchOut: "",
          workedHours: "0h 0m",
          attendance: "A",
        });
      }
    }

    success(res, "Attendance data retrieved successfully", response);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// AUTO MAIL FOR NOT PUNCH OUT EMPLOYEES
// Send email to unpunched employees

async function sendUnpunchedOutReport(branchId) {
  // console.log(`Sending unpunched out report for branch ${branchId}`);
  try {
    const employees = await employeeModel.find({ branchId });
    const employeeIds = employees.map((emp) => emp._id);
    const todayFormatted = new Date().toISOString().split("T")[0];

    const unpunchedEmployees = await attendanceModel.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds },
          $or: [{ punchOutTime: "" }, { punchOutTime: null }],
          emailSend: "false",
        },
      },
      {
        $addFields: {
          sanitizedPunchInTime: {
            $trim: {
              input: { $substrCP: ["$punchInTime", 0, 19] },
            },
          },
        },
      },
      {
        $addFields: {
          punchInDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: "$sanitizedPunchInTime" },
            },
          },
        },
      },
      {
        $match: {
          punchInDate: todayFormatted,
        },
      },
    ]);

    console.log(`Found Employee ${unpunchedEmployees.length} `);

    const unpunchedDetails = unpunchedEmployees.map((attendance) => {
      const employee = employees.find((emp) =>
        emp._id.equals(attendance.employeeId)
      );
      return {
        _id: attendance._id,
        punchInTime: attendance.punchInTime,
        punchOutTime: attendance.punchOutTime,
        employeeId: employee?._id,
        employeeName: employee?.employeName,
        employeeEmail: employee?.workEmail,
        managerId: employee?.reportingManagerId,
      };
    });

    // Send emails to unpunched employees
    for (let employee of unpunchedDetails) {
      if (employee.employeeEmail) {
        const emailSent = await sendEmployeeEmail(
          employee.employeeEmail,
          employee.employeeName
        );

        // ✅ Update attendanceModel only if email is successfully sent
        if (emailSent) {
          await attendanceModel.updateOne(
            { _id: employee._id, employeeId: employee.employeeId },
            { $set: { emailSend: "true" } }
          );
        }
      }
    }

    // ✅ Group employees by reporting manager using a `Map`
    const managerMap = new Map();
    unpunchedDetails.forEach((attendance) => {
      if (attendance.managerId) {
        if (!managerMap.has(attendance.managerId)) {
          managerMap.set(attendance.managerId, []);
        }
        managerMap.get(attendance.managerId).push(attendance);
      }
    });

    console.log(`Found Manager ${managerMap.size} `);

    // ✅ Send only one email per manager
    for (let [managerId, employeeList] of managerMap) {
      const manager = await employeeModel.findById(managerId);
      if (manager && manager.workEmail) {
        const excelBuffer = await generateExcel(employeeList);
        await sendManagerEmail(
          manager.workEmail,
          excelBuffer,
          manager.employeName
        );
      }
    }
  } catch (error) {
    console.error("❌ Error sending emails:", error);
  }
}

// Generate Excel report
async function generateExcel(attendanceData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Unpunched Employees");

  worksheet.columns = [
    { header: "Employee Name", key: "name", width: 20 },
    { header: "Employee ID", key: "id", width: 20 },
    { header: "Punch-In Time", key: "punchIn", width: 25 },
    { header: "Punch-Out Time", key: "punchOut", width: 25 },
  ];

  attendanceData.forEach((attendance) => {
    worksheet.addRow({
      name: attendance.employeeName,
      id: attendance.employeeId,
      punchIn: attendance.punchInTime,
      punchOut: attendance.punchOutTime || "N/A",
    });
  });

  return workbook.xlsx.writeBuffer();
}

// Dynamically schedule reports for each branch to remove dublicate jobs //
// const cronJobs = {}; // Store scheduled jobs globally

// async function scheduleUnpunchedReports() {
//   try {
//     const branches = await Branch.find({}, "_id punchOutTime");
//     const timeGroups = {};

//     branches.forEach((branch) => {
//       if (!branch?.punchOutTime) return;

//       let punchOutTimeStr = branch.punchOutTime.trim();
//       const parsedTime = moment.tz(punchOutTimeStr, "YYYY-MM-DDTHH:mm:ss A", "Asia/Kolkata");

//       if (!parsedTime.isValid()) {
//         console.error(`❌ Invalid time format for Branch ${branch._id}: ${punchOutTimeStr}`);
//         return;
//       }

//       const utcTime = parsedTime.clone().utc();
//       const minute = utcTime.minute();
//       const hour = utcTime.hour();
//       const cronTime = `${minute} ${hour} * * *`;

//       if (!timeGroups[cronTime]) {
//         timeGroups[cronTime] = [];
//       }
//       timeGroups[cronTime].push(branch._id);
//     });

//     Object.entries(timeGroups).forEach(([cronTime, branchIds]) => {
//       // ✅ Prevent duplicate jobs
//       if (cronJobs[cronTime]) {
//         console.warn(`⚠️ Cron job for ${cronTime} already exists, skipping duplicate scheduling.`);
//         return;
//       }

//       cronJobs[cronTime] = cron.schedule(cronTime, async () => {
//         console.log(`🚀 Running reports for branches: ${branchIds.join(", ")} at ${cronTime} UTC`);

//         for (let branchId of branchIds) {
//           await sendUnpunchedOutReport(branchId);
//         }
//       });
//     });

//   } catch (error) {
//     console.error("❌ Error scheduling reports:", error);
//   }
// }

async function scheduleUnpunchedReports() {
  try {
    const branches = await Branch.find({}, "_id punchOutTime");

    // ✅ Group branches by punchOutTime
    const timeGroups = {};

    branches.forEach((branch) => {
      if (!branch?.punchOutTime) {
        return;
      }

      let punchOutTimeStr = branch.punchOutTime.trim(); // Remove spaces

      // ✅ Convert IST (Asia/Kolkata) to UTC
      const parsedTime = moment.tz(
        punchOutTimeStr,
        "YYYY-MM-DDTHH:mm:ss A",
        "Asia/Kolkata"
      );

      if (!parsedTime.isValid()) {
        console.error(
          `❌ Invalid time format for Branch ${branch._id}: ${punchOutTimeStr}`
        );
        return;
      }

      const utcTime = parsedTime.clone().utc();
      const minute = utcTime.minute();
      const hour = utcTime.hour();

      // 🕒 Generate cron time string
      const cronTime = `${minute} ${hour} * * *`;

      // ✅ Group branches with the same punch-out time
      if (!timeGroups[cronTime]) {
        timeGroups[cronTime] = [];
      }
      timeGroups[cronTime].push(branch._id);
    });

    // ✅ Schedule cron jobs for each unique time slot
    Object.entries(timeGroups).forEach(([cronTime, branchIds]) => {
      cron.schedule(cronTime, async () => {
        const currentUTC = moment.utc();
        if (
          currentUTC.hour() === parseInt(cronTime.split(" ")[1]) &&
          currentUTC.minute() === parseInt(cronTime.split(" ")[0])
        ) {
          console.log(
            `🚀 Running reports for branches: ${branchIds.join(
              ", "
            )} at ${cronTime} UTC`
          );

          // Run reports for all branches sharing this time
          for (let branchId of branchIds) {
            await sendUnpunchedOutReport(branchId);
          }
        } else {
          console.warn(
            `⚠️ Skipping report - Current UTC: ${currentUTC.format(
              "HH:mm"
            )}, Scheduled: ${cronTime}`
          );
        }
      });
    });
  } catch (error) {
    console.error("❌ Error scheduling reports:", error);
  }
}

async function sendPunchOutReminder(req, res) {
  try {
    const todayIST = moment().tz("Asia/Kolkata").startOf("day");
    const startOfDayUTC = todayIST.clone().tz("UTC").toDate();
    const endOfDayUTC = todayIST.clone().endOf("day").tz("UTC").toDate();

    const punchedInEmployees = await attendanceModel.find({
      date: { $gte: startOfDayUTC, $lt: endOfDayUTC },
      emailSend: "false",
    });

    if (punchedInEmployees.length === 0) {
      return res
        .status(200)
        .json({ message: "No employees punched in today." });
    }

    console.log(
      `Found ${punchedInEmployees.length} employees who punched in today.`
    );

    const employeeIds = punchedInEmployees.map((att) => att.employeeId);
    const employees = await employeeModel.find({ _id: { $in: employeeIds } });

    const unpunchedDetails = {};
    const attendanceUpdates = [];
    const employeeEmailPromises = [];

    // Send emails to employees and collect details for managers
    employees.forEach((employee) => {
      const punchedInRecord = punchedInEmployees.find(
        (att) => att.employeeId.toString() == employee._id.toString()
      );

      if (employee.reportingManagerId) {
        const managerId = employee.reportingManagerId.toString();
        if (!unpunchedDetails[managerId]) unpunchedDetails[managerId] = [];

        unpunchedDetails[managerId].push({
          employeeId: employee._id,
          employeeName: employee.employeName,
          punchInTime: punchedInRecord.punchInTime,
          punchOutTime: punchedInRecord.punchOutTime || "N/A",
        });

        attendanceUpdates.push(punchedInRecord._id);
      }

      // Send email to individual employee
      if (employee.workEmail) {
        const emailPromise = sendEmployeeEmail(
          employee.workEmail,
          employee.employeName
        ).then((emailSent) => {
          if (emailSent) {
            console.log(`✅ Email sent successfully to ${employee.workEmail}`);
          } else {
            console.log(`❌ Failed to send email to ${employee.workEmail}`);
          }
        });
        employeeEmailPromises.push(emailPromise);
      }
    });

    // Wait for all employee emails to be sent
    await Promise.all(employeeEmailPromises);

    // Update attendance records as email sent
    if (attendanceUpdates.length > 0) {
      await attendanceModel.updateMany(
        { _id: { $in: attendanceUpdates } },
        { $set: { emailSend: "true" } }
      );
    }

    const managerIds = Object.keys(unpunchedDetails);
    const managers = await employeeModel.find({ _id: { $in: managerIds } });

    const managerEmailPromises = managers.map(async (manager) => {
      const managerId = manager._id.toString();
      const employeeList = unpunchedDetails[managerId];
      const excelBuffer = await generateExcel(employeeList);

      return sendManagerEmail(
        manager.workEmail,
        excelBuffer,
        manager.employeName
      );
    });

    await Promise.all(managerEmailPromises);

    console.log(`Found ${managerIds.length} managers to send reports to.`);

    return res.status(200).json({
      status: true,
      message:
        "Punch-out reminder emails sent successfully to employees and managers.",
    });
  } catch (error) {
    console.error("❌ Error sending punch-out reminder emails:", error);
    return res.status(500).json({
      status: false,
      message: "Error sending punch-out reminder emails.",
    });
  }
}

// async function sendNoPunchInEmail(req, res) {
//   try {
//     const todayIST = moment().tz("Asia/Kolkata").startOf("day");
//     const startOfDayUTC = todayIST.clone().tz("UTC").toDate();
//     const endOfDayUTC = todayIST.clone().endOf("day").tz("UTC").toDate();

//     const todayDay = todayIST.day();
//     if (todayDay == 0) {
//       // 0 = Sunday
//       return success(res, "Today is sunday my dear.");
//     }

//     const allEmployees = await employeeModel.find({ status: "active" });

//     const punchedInEmployees = await attendanceModel.find({
//       date: { $gte: startOfDayUTC, $lt: endOfDayUTC },
//     });

//     const punchedInEmployeeIds = new Set(
//       punchedInEmployees.map((att) => att.employeeId.toString())
//     );

//     const noPunchInEmployees = allEmployees.filter(
//       (emp) => !punchedInEmployeeIds.has(emp._id.toString())
//     );

//     if (noPunchInEmployees.length === 0) {
//       return success(
//         res,
//         "All employees have punched in today. No need to send reminder emails."
//       );
//     }

//     console.log(
//       `Found ${noPunchInEmployees.length} employees who haven't punched in today.`
//     );

//     // Nodemailer Transporter Configuration
//     const transporter = nodemailer.createTransport({
//       host: process.env.HRMS_EMAIL_HOST,
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.HRMS_EMAIL_USER,
//         pass: process.env.HRMS_EMAIL_PASSWORD,
//       },
//       tls: { rejectUnauthorized: false },
//     });

//     // Prepare and send emails to each employee who hasn't punched in
//     const emailPromises = noPunchInEmployees.map(async (employee) => {
//       if (employee.workEmail) {
//         const mailOptions = {
//           from: process.env.HRMS_EMAIL_USER,
//           to: employee.workEmail,
//           subject: `🚨 Reminder: Punch-In Record Missing for Today`,
//           html: `
//             <p>Dear <strong>${employee.employeName}</strong>,</p>
//             <p>Our records show that you have not punched in for today (${todayIST.format(
//               "DD-MM-YYYY"
//             )}).</p>
//             <p>Please ensure to punch in to maintain accurate attendance records.</p>
//             <p><strong>Note:</strong> This is an automated notification. No reply is required.</p>
//             <br>
//             <p>Best regards,</p>
//             <p><strong>HR Department</strong></p>
//             <p>Fincoopers Capital Private Limited</p>
//           `,
//         };

//         try {
//           await transporter.sendMail(mailOptions);
//           console.log(`✅ Email sent to ${employee.workEmail}`);
//         } catch (error) {
//           console.error(
//             `❌ Failed to send email to ${employee.workEmail}:`,
//             error
//           );
//         }
//       }
//     });

//     await Promise.all(emailPromises);

//     return success(
//       res,
//       "No-punch-in reminder emails sent successfully to employees."
//     );
//   } catch (error) {
//     console.error("❌ Error sending no-punch-in emails:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Error sending no-punch-in emails.",
//     });
//   }
// }

// get employee list who is complete 6 months from his joining data //

async function getEmployeeByJoiningDate(req, res) {
  try {
    const sixMonthsAgo = moment()
      .tz("Asia/Kolkata")
      .subtract(6, "months")
      .toDate();

    // Using aggregation pipeline to find employees
    const employeeList = await employeeModel.aggregate([
      {
        $match: {
          status: "active",
          joiningDate: { $lte: sixMonthsAgo },
        },
      },
      // branch lookup to get branch details //
      {
        $lookup: {
          from: "newbranches", // Ensure your collection name is correct
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $unwind: {
          path: "$branch",
          preserveNullAndEmptyArrays: true,
        },
      },

      // reporting manager lookup to get manager details //

      {
        $lookup: {
          from: "employees", // Ensure your collection name is correct
          localField: "reportingManagerId",
          foreignField: "_id",
          as: "manager",
        },
      },
      {
        $unwind: {
          path: "$manager",
          preserveNullAndEmptyArrays: true,
        },
      },

      // department lookup to get department details //

      {
        $lookup: {
          from: "newdepartments", // Ensure your collection name is correct
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true,
        },
      },

      // designation lookup to get designation details //
      {
        $lookup: {
          from: "newdesignations", // Ensure your collection name is correct
          localField: "designationId",
          foreignField: "_id",
          as: "designation",
        },
      },

      {
        $unwind: {
          path: "$designation",
          preserveNullAndEmptyArrays: true,
        },
      },

      // worklocation lookup to get worklocation details //

      {
        $lookup: {
          from: "newworklocations", // Ensure your collection name is correct
          localField: "workLocationId",
          foreignField: "_id",
          as: "workLocation",
        },
      },

      {
        $unwind: {
          path: "$workLocation",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          employeName: 1,
          joiningDate: 1,
          branch: {
            _id: 1,
            name: 1,
          },
          manager: {
            _id: 1,
            employeName: 1,
            workEmail: 1,
          },
          department: {
            _id: 1,
            name: 1,
          },
          designation: {
            _id: 1,
            name: 1,
          },
          workLocation: {
            _id: 1,
            name: 1,
          },
          referee: 1,
          email: 1,
          mobileNo: 1,
          gender: 1,
          letter: { $ifNull: ["$letter", "Not-generated"] },
          appoinmentLetter: { $ifNull: ["$appoinmentLetter", ""] }, // If 'letter' is not present, return "false"
        },
      },
    ]);

    return success(
      res,
      "Employees who are complete 6 months from their joining data:",
      {
        dashboardInfo: {
          totalEmployees: employeeList.length,
        },
        employees: employeeList,
      }
    );
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    return res.status(500).json({ error: error.message });
  }
}

// async function getTest(req, res) {
//   try {
//     let data = await branchModel.aggregate([
//       // Filter only active branches
//       {
//         $match: {
//           "isActive": true,
//           "status": "active"
//         }
//       },
//       // Lookup employees from the employees collection
//       {
//         $lookup: {
//           from: "employees",
//           localField: "_id",
//           foreignField: "branchId",
//           as: "employees"
//         }
//       },
//       // Project and handle punchin_time within the aggregation
//       {
//         $project: {
//           branch_name: "$name",
//           branch_city: "$city",
//           branch_state: "$state",
//           branch_type: "$type",
//           // Handle invalid punchin_time in the pipeline
//           punchin_time: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$punchInTime", null] },
//                   { $eq: ["$punchInTime", ""] },
//                   { $regexMatch: { input: { $ifNull: ["$punchInTime", ""] }, regex: "NaN" } }
//                 ]
//               },
//               then: "Unspecified Time",
//               else: "$punchInTime"
//             }
//           },
//           punchout_time: "$punchOutTime",
//           total_employees: { $size: "$employees" },
//           // active_employees: {
//           //   $size: {
//           //     $filter: {
//           //       input: "$employees",
//           //       as: "emp",
//           //       cond: { $eq: ["$emp.status", "active"] }
//           //     }
//           //   }
//           // },
//           employees: {
//             $map: {
//               input: "$employees",
//               as: "emp",
//               in: {
//                 id: "$$emp.employeUniqueId",
//                 name: "$$emp.employeName",
//                 email: "$$emp.workEmail",
//                 mobile: "$$emp.mobileNo",
//                 status: "$$emp.status"
//               }
//             }
//           }
//         }
//       },
//       // Group by punchin_time (now clean)
//       {
//         $group: {
//           _id: "$punchin_time",
//           branches: {
//             $push: {
//               _id: "$_id",
//               branch_name: "$branch_name",
//               branch_city: "$branch_city",
//               branch_state: "$branch_state",
//               branch_type: "$branch_type",
//               punchout_time: "$punchout_time",
//               total_employees: "$total_employees",
//               active_employees: "$active_employees",
//               employees: "$employees"
//             }
//           },
//           total_branches: { $sum: 1 },
//           total_employees_all_branches: { $sum: "$total_employees" },
//           // active_employees_all_branches: { $sum: "$active_employees" }
//         }
//       },
//       // Add back the punch-in time as a regular field
//       {
//         $project: {
//           _id: 0,
//           punchin_time: "$_id",
//           total_branches: 1,
//           total_employees_all_branches: 1,
//           // active_employees_all_branches: 1,
//           branches: 1
//         }
//       },
//       // Simple sort by punchin_time
//       {
//         $sort: { punchin_time: 1 }
//       },

//       // Additional stage to handle sorting order - put "Unspecified Time" at the end
//       {
//         $addFields: {
//           sortOrder: {
//             $cond: [
//               { $eq: ["$punchin_time", "Unspecified Time"] },
//               1,
//               0
//             ]
//           }
//         }
//       },
//       {
//         $sort: { sortOrder: 1, punchin_time: 1 }
//       },
//       {
//         $project: {
//           punchin_time: 1,
//           total_branches: 1,
//           total_employees_all_branches: 1,
//           active_employees_all_branches: 1,
//           branches: 1
//           // sortOrder field is excluded by not including it
//         }
//       }
//     ]);

//     return success(res, "Branches grouped by punch-in time:", data);
//   } catch (error) {
//     console.error("❌ Error fetching and grouping branches:", error);
//     return res.status(500).json({ error: error.message });
//   }
// }

// async function getTest(req, res) {
//   try {
//     // First, get the data with basic branch and employee info
//     let data = await branchModel.aggregate([
//       // Filter only active branches
//       {
//         $match: {
//           "isActive": true,
//           "status": "active"
//         }
//       },
//       // Lookup employees from the employees collection
//       {
//         $lookup: {
//           from: "employees",
//           localField: "_id",
//           foreignField: "branchId",
//           as: "employees"
//         }
//       },
//       // Project and format data
//       {
//         $project: {
//           branch_name: "$name",
//           branch_city: "$city",
//           branch_state: "$state",
//           branch_type: "$type",
//           // Handle invalid punchin_time in the pipeline
//           punchin_time: {
//             $cond: {
//               if: {
//                 $or: [
//                   { $eq: ["$punchInTime", null] },
//                   { $eq: ["$punchInTime", ""] },
//                   { $regexMatch: { input: { $ifNull: ["$punchInTime", ""] }, regex: "NaN" } }
//                 ]
//               },
//               then: "Unspecified Time",
//               else: "$punchInTime"
//             }
//           },
//           punchout_time: "$punchOutTime",
//           total_employees: { $size: "$employees" },

//           // Format employees with manager ID information
//           employees: {
//             $map: {
//               input: "$employees",
//               as: "emp",
//               in: {
//                 id: "$$emp.employeUniqueId",
//                 name: "$$emp.employeName",
//                 email: "$$emp.workEmail",
//                 mobile: "$$emp.mobileNo",
//                 status: "$$emp.status",
//                 manager_id: {
//                   $cond: {
//                     if: { $eq: ["$$emp.reportingManagerId", null] },
//                     then: null,
//                     else: { $toString: "$$emp.reportingManagerId" }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },

//       // Group by punchin_time
//       {
//         $group: {
//           _id: "$punchin_time",
//           branches: {
//             $push: {
//               _id: "$_id",
//               branch_name: "$branch_name",
//               branch_city: "$branch_city",
//               branch_state: "$branch_state",
//               branch_type: "$branch_type",
//               punchout_time: "$punchout_time",
//               total_employees: "$total_employees",
//               employees: "$employees"
//             }
//           },
//           total_branches: { $sum: 1 },
//           total_employees_all_branches: { $sum: "$total_employees" }
//         }
//       },

//       // Add back the punch-in time as a regular field
//       {
//         $project: {
//           _id: 0,
//           punchin_time: "$_id",
//           total_branches: 1,
//           total_employees_all_branches: 1,
//           branches: 1
//         }
//       },

//       // Add a field to help with sorting "Unspecified Time" at the end
//       {
//         $addFields: {
//           sortOrder: {
//             $cond: [
//               { $eq: ["$punchin_time", "Unspecified Time"] },
//               1,
//               0
//             ]
//           }
//         }
//       },

//       // Sort by the sortOrder field first, then by punchin_time
//       {
//         $sort: { sortOrder: 1, punchin_time: 1 }
//       },

//       // Final projection to remove the sortOrder field
//       {
//         $project: {
//           punchin_time: 1,
//           total_branches: 1,
//           total_employees_all_branches: 1,
//           branches: 1
//         }
//       }
//     ]);

//     // Now process the data to group employees by manager
//     data.forEach(timeGroup => {
//       timeGroup.branches.forEach(branch => {
//         // Group employees by manager
//         const managerGroups = {};

//         branch.employees.forEach(emp => {
//           const managerId = emp.manager_id || "no_manager";
//           if (!managerGroups[managerId]) {
//             managerGroups[managerId] = {
//               manager_id: managerId === "no_manager" ? null : managerId,
//               manager_name: managerId === "no_manager" ? "No Manager" : "Manager " + managerId,
//               employees: []
//             };
//           }
//           managerGroups[managerId].employees.push(emp);
//         });

//         // Convert the groups to an array
//         branch.employees_by_manager = Object.values(managerGroups);
//       });
//     });

//     return success(res, "Branches grouped by punch-in time and employees grouped by reporting manager:", data);
//   } catch (error) {
//     console.error("❌ Error fetching and grouping branches:", error);
//     return res.status(500).json({ error: error.message });
//   }
// }

async function sendNoPunchInEmail(req, res) {
  try {
    // First, get the data with basic branch and employee info
    let data = await branchModel.aggregate([
      // Filter only active branches
      {
        $match: {
          isActive: true,
          status: "active",
        },
      },

      // Project and format data
      {
        $project: {
          branch_name: "$name",
          // Handle invalid punchin_time and extract only the time portion using regex
          punchin_time: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$punchInTime", null] },
                  { $eq: ["$punchInTime", ""] },
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$punchInTime", ""] },
                      regex: "NaN",
                    },
                  },
                ],
              },
              then: "Unspecified Time",
              else: {
                $let: {
                  vars: {
                    // Extract the time portion using regex
                    timeMatch: {
                      $regexFind: {
                        input: "$punchInTime",
                        regex: "(\\d{1,2}:\\d{2}:\\d{2})(\\s*[AP]M)?",
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $eq: ["$$timeMatch", null] },
                      then: "Unspecified Time",
                      else: "$$timeMatch.match",
                    },
                  },
                },
              },
            },
          },
          punchout_time: "$punchOutTime",
        },
      },

      // Group by punchin_time
      {
        $group: {
          _id: "$punchin_time",
          branches: {
            $push: "$_id",
          },
        },
      },

      // Add back the punch-in time as a regular field
      {
        $project: {
          _id: 0,
          punchin_time: "$_id",
          branches: 1,
        },
      },
    ]);

    // let a = await Promise.all(data.map(async (branchGroup)=>{
    //   branchGroup.mailData = await getUserToMail(branchGroup.branches)
    //   return branchGroup
    // }))

    return data;
    // return success(
    //   res,
    //   "Branches grouped by punch-in time and employees grouped by reporting manager:",
    //   data
    // );
  } catch (error) {
    console.error("❌ Error fetching and grouping branches:", error);
    return [];
    // return res.status(500).json({ error: error.message });
  }
}

async function sendNoPunchOutEmail(req, res) {
  try {
    // Get branches with punchOutTime logic
    let data = await branchModel.aggregate([
      {
        $match: {
          isActive: true,
          status: "active",
        },
      },

      {
        $project: {
          branch_name: "$name",
          // Handle invalid punchout_time and extract time portion
          punchout_time: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$punchOutTime", null] },
                  { $eq: ["$punchOutTime", ""] },
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$punchOutTime", ""] },
                      regex: "NaN",
                    },
                  },
                ],
              },
              then: "Unspecified Time",
              else: {
                $let: {
                  vars: {
                    timeMatch: {
                      $regexFind: {
                        input: "$punchOutTime",
                        regex: "(\\d{1,2}:\\d{2}:\\d{2})(\\s*[AP]M)?",
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $eq: ["$$timeMatch", null] },
                      then: "Unspecified Time",
                      else: "$$timeMatch.match",
                    },
                  },
                },
              },
            },
          },
          punchin_time: "$punchInTime",
        },
      },

      {
        $group: {
          _id: "$punchout_time",
          branches: {
            $push: "$_id",
          },
        },
      },

      {
        $project: {
          _id: 0,
          punchout_time: "$_id",
          branches: 1,
        },
      },
    ]);

    // Fetch mailData for each branch group
    // let a = await Promise.all(
    //   data.map(async (branchGroup) => {
    //     branchGroup.mailData = await getUserToMailPunchOut(branchGroup.branches);
    //     return branchGroup;
    //   })
    // );
    return data;
    // return success(
    //   res,
    //   "Branches grouped by punch-out time and employees grouped by reporting manager:",
    //   data
    // );
  } catch (error) {
    console.error("❌ Error fetching and grouping punch-out branches:", error);
    return [];
    // return res.status(500).json({ error: error.message });
  }
}

async function generateExcelWithNameAndEmail(employeesData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Employees");

  worksheet.columns = [
    { header: "Employee Name", key: "name", width: 25 },
    { header: "Work Email", key: "email", width: 30 },
  ];

  employeesData.forEach((employee) => {
    worksheet.addRow({
      name: employee.employeName,
      email: employee.workEmail,
    });
  });

  return workbook.xlsx.writeBuffer();
}

async function getUserToMail(branches) {
  try {
    const today = new Date();
    // Check if today is Sunday (0 = Sunday, 6 = Saturday)
    if (today.getDay() === 0) {
      console.log("🛌 Today is Sunday, no need to send emails.");
      return "Today is Sunday, my dear 😄";
    }

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const punchedInEmployees = await attendanceModel
      .find({
        date: { $gt: startOfToday, $lt: endOfToday },
      })
      .select("-_id employeeId");
    // .lean();

    let employeeIdList = punchedInEmployees.map((data) => data.employeeId);

    const allEmployees = await employeeModel.aggregate([
      {
        $match: {
          status: "active",
          branchId: { $in: branches },
          _id: { $nin: employeeIdList },
        },
      },
      {
        $project: {
          _id: 1,
          employeName: 1,
          workEmail: 1,
          reportingManagerId: 1,
        },
      }, // Group by reporting manager ID
      {
        $group: {
          _id: {
            managerId: { $ifNull: ["$reportingManagerId", null] },
          },
          employees: { $push: "$$ROOT" },
        },
      },
      // Lookup reporting manager details
      {
        $lookup: {
          from: "employees", // Make sure this matches your collection name
          let: { managerId: "$_id.managerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$managerId", null] },
                    { $eq: ["$_id", "$$managerId"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                employeName: 1,
                workEmail: 1,
              },
            },
          ],
          as: "managerDetails",
        },
      },
      // Format the output
      {
        $project: {
          _id: 0,
          reportingManagerId: "$_id.managerId",
          managerDetails: {
            $cond: [
              { $eq: ["$managerDetails", []] },
              null,
              { $arrayElemAt: ["$managerDetails", 0] },
            ],
          },
          employees: 1,
        },
      },
      // Sort so null reporting managers come last
      {
        $sort: {
          reportingManagerId: 1,
        },
      },
    ]);

    const transporter = nodemailer.createTransport({
      host: process.env.HRMS_EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.HRMS_EMAIL_USER,
        pass: process.env.HRMS_EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const todayIST = moment().utcOffset("+05:30");

    for (const group of allEmployees) {
      const { employees, managerDetails, reportingManagerId } = group;
      const emailPromises = employees.map(async (employee) => {
        if (employee.workEmail) {
          const mailOptions = {
            from: process.env.HRMS_EMAIL_USER,
            to: employee.workEmail,
            subject: `🚨 Reminder: Punch-In Record Missing for Today`,
            html: `
          <p>Dear <strong>${employee.employeName}</strong>,</p>
          <p>Our records show that you have not punched in for today (${todayIST.format(
            "DD-MM-YYYY"
          )}).</p>
          <p>Please ensure to punch in to maintain accurate attendance records.</p>
          <p><strong>Note:</strong> This is an automated notification. No reply is required.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>HR Department</strong></p>
          <p>Fincoopers Capital Private Limited</p>
        `,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${employee.workEmail}`);
          } catch (error) {
            console.error(
              `❌ Failed to send email to ${employee.workEmail}:`,
              error
            );
          }
        }
      });

      await Promise.all(emailPromises);

      if (reportingManagerId !== null && managerDetails?.workEmail) {
        const excelBuffer = await generateExcelWithNameAndEmail(employees);

        const managerMailOptions = {
          from: process.env.HRMS_EMAIL_USER,
          to: managerDetails.workEmail,
          subject: `📋 Unpunched Employees Report - ${todayIST.format(
            "DD-MM-YYYY"
          )}`,
          html: `
        <p>Dear <strong>${managerDetails.employeName}</strong>,</p>
        <p>Please find attached the list of your team members who have not punched in today (${todayIST.format(
          "DD-MM-YYYY"
        )}).</p>
        <p>Kindly ensure appropriate follow-up.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>HR Department</strong></p>
        <p>Fincoopers Capital Private Limited</p>
      `,
          attachments: [
            {
              filename: `Unpunched_Team_${todayIST.format("DD-MM-YYYY")}.xlsx`,
              content: excelBuffer,
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ],
        };

        try {
          await transporter.sendMail(managerMailOptions);
          console.log(
            `📩 Summary sent to manager ${managerDetails.employeName} (${managerDetails.workEmail})`
          );
        } catch (error) {
          console.error(
            `❌ Failed to send summary to manager ${managerDetails.workEmail}:`,
            error
          );
        }
      }
    }

    return allEmployees;
  } catch (error) {
    console.error("❌ Error fetching and grouping branches:", error);
    return [];
  }
}

async function getUserToMailPunchOut(branches) {
  try {
    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Get all employees who PUNCHED IN today, but DIDN'T PUNCH OUT
    const punchedInButNotOut = await attendanceModel
      .find({
        date: {
          $gt: startOfToday,
          $lt: endOfToday,
        },
        punchInTime: { $ne: null },
        $or: [{ punchOutTime: null }, { punchOutTime: "" }],
      })
      .select("employeeId -_id");

    const employeeIdList = punchedInButNotOut.map((data) => data.employeeId);

    // 2. Get employee details grouped by reporting manager
    const groupedEmployees = await employeeModel.aggregate([
      {
        $match: {
          status: "active",
          branchId: { $in: branches },
          _id: { $in: employeeIdList },
        },
      },
      {
        $project: {
          _id: 1,
          employeName: 1,
          workEmail: 1,
          reportingManagerId: 1,
        },
      },
      {
        $group: {
          _id: { managerId: { $ifNull: ["$reportingManagerId", null] } },
          employees: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "employees",
          let: { managerId: "$_id.managerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$managerId", null] },
                    { $eq: ["$_id", "$$managerId"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                employeName: 1,
                workEmail: 1,
              },
            },
          ],
          as: "managerDetails",
        },
      },
      {
        $project: {
          _id: 0,
          reportingManagerId: "$_id.managerId",
          managerDetails: {
            $cond: [
              { $eq: ["$managerDetails", []] },
              null,
              { $arrayElemAt: ["$managerDetails", 0] },
            ],
          },
          employees: 1,
        },
      },
      { $sort: { reportingManagerId: 1 } },
    ]);

    // 3. Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.HRMS_EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.HRMS_EMAIL_USER,
        pass: process.env.HRMS_EMAIL_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    const todayIST = moment().utcOffset("+05:30");
    // 4. Loop and send emails

    for (const group of groupedEmployees) {
      const { employees, managerDetails, reportingManagerId } = group;

      // Send individual emails to employees
      const emailPromises = employees.map(async (employee) => {
        if (employee.workEmail) {
          const mailOptions = {
            from: process.env.HRMS_EMAIL_USER,
            to: employee.workEmail,
            subject: `🚨 Reminder: You Forgot to Punch-Out Today`,
            html: `
              <p>Dear <strong>${employee.employeName}</strong>,</p>
              <p>Our system shows that you punched in today but haven't punched out as of ${todayIST}.</p>
              <p>Please punch out to complete your attendance record.</p>
              <br>
              <p><strong>Note:</strong> This is an automated reminder. No reply is necessary.</p>
              <br>
              <p>Best regards,<br>HR Department<br>Fincoopers Capital Private Limited</p>
            `,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Punch-out email sent to ${employee.workEmail}`);
          } catch (error) {
            console.error(
              `❌ Error sending email to ${employee.workEmail}:`,
              error
            );
          }
        }
      });

      await Promise.all(emailPromises);

      // Send summary to manager (if exists)
      if (reportingManagerId !== null && managerDetails?.workEmail) {
        const excelBuffer = await generateExcelWithNameAndEmail(employees);

        const managerMailOptions = {
          from: process.env.HRMS_EMAIL_USER,
          to: managerDetails.workEmail,
          subject: `📋 Punch-Out Missing Report - ${todayIST}`,
          html: `
            <p>Dear <strong>${managerDetails.employeName}</strong>,</p>
            <p>Please find attached the list of your team members who have not punched out today (${todayIST}).</p>
            <p>Kindly ensure appropriate follow-up.</p>
            <br>
            <p>Best regards,<br>HR Department<br>Fincoopers Capital Private Limited</p>
          `,
          attachments: [
            {
              filename: `UnpunchedOut_Team_${todayIST}.xlsx`,
              content: excelBuffer,
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ],
        };

        try {
          await transporter.sendMail(managerMailOptions);
          console.log(
            `📩 Summary sent to manager ${managerDetails.employeName} (${managerDetails.workEmail})`
          );
        } catch (error) {
          console.error(
            `❌ Failed to send summary to manager ${managerDetails.workEmail}:`,
            error
          );
        }
      }
    }

    return groupedEmployees;
  } catch (error) {
    console.error("❌ Error in getUserToMailPunchOut:", error);
    return [];
  }
}

// send the Appoinment letter //

async function sendAppointmentLetter(req, res) {
  try {
    const employee = await employeeModel.findById(req.body.employeeId);
    if (!employee) {
      return badRequest(res, "Employee not found");
    }

    const currentDate = moment().tz("Asia/Kolkata").format("DD-MM-YYYY");
    const appointmentDate = moment(req.body.appointmentDate)
      .tz("Asia/Kolkata")
      .format("DD-MM-YYYY");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear <strong>${employee.employeName}</strong>,</p>

        <p>Congratulations! We are pleased to offer you the position of <strong>${req.body.position}</strong> at <strong>Fincoopers Capital Private Limited</strong>.</p>

        <p>Your appointment is effective from <strong>${appointmentDate}</strong>. Please find the attached appointment letter for more details regarding your employment terms and conditions.</p>

        <p>If you have any queries, feel free to reach out to us.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>HR Department</strong></p>
        <p>Fincoopers Capital Private Limited</p>
      </div>
    `;

    const attachment = req.body.attachment
      ? [
          {
            filename: req.body.attachmentName || "Appointment_Letter.pdf",
            path: req.body.attachment, // This should be a file path or URL to the attachment
          },
        ]
      : [];

    const sendEmail = await hrmsSendEmail(
      employee.workEmail,
      null,
      `Appointment Letter for ${employee.employeName}`,
      html,
      attachment
    );

    if (sendEmail) {
      const Updateletter = await employeeModel.findByIdAndUpdate(
        req.body.employeeId,
        { $set: { letter: "generated" } },
        { new: true } // Optional: Returns the updated document instead of the original
      );

      return success(res, "Appointment letter sent successfully");
    } else {
      return badRequest(res, "Failed to send appointment letter");
    }
  } catch (error) {
    console.error("Error fetching employee:", error);
    return unknownError(
      res,
      "An error occurred while sending the appointment letter"
    );
  }
}

// make a pdf of Appliment letter //

async function generateAppointmentLetterPdf(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const ID = req.body.Id;
    const position = req.body.position;

    const findEmployee = await employeeModel.findById(ID);
    if (!findEmployee) {
      return badRequest(res, "Employee not found");
    }

    const destrcutedEmployee = {
      employeName: findEmployee.employeName,
      joiningDate: moment(findEmployee.joiningDate)
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY"),
      email: findEmployee.workEmail,
      mobileNo: findEmployee.mobileNo,
      gender: findEmployee.gender,
      letter: findEmployee.letter,
      appointmentLetter: findEmployee.appointmentLetter,
    };

    const appointmentLetterUrl = await generateAppointmentPDF(
      destrcutedEmployee, // Employee details
      position, // Position
      "Fin Coopers Capital Private Limited", // Company Name
      findEmployee.joiningDate // Joining Date
    );

    if (appointmentLetterUrl) {
      const updatedata = await employeeModel.findByIdAndUpdate(
        ID,
        { $set: { appoinmentLetter: appointmentLetterUrl } },
        { new: true }
      );
    } else {
      return badRequest(res, "Failed to generate appointment letter PDF");
    }

    return success(res, "Appointment letter PDF generated successfully", {
      appointmentLetterUrl,
    });
  } catch (error) {
    console.error("Error generating appointment letter PDF:", error);
    return unknownError(
      res,
      "An error occurred while generating the appointment letter PDF"
    );
  }
}

// cron.schedule("*/1 * * * *", () => {
//   // console.log("��� Cron job started");
//   scheduleUnpunchedReports();
// });

// FOR WHO IS NOT PUCNHIN  //

// Attendece Regulation model //

async function addRegulation(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { date, Reason, mark } = req.body;

    const employeeId = req.Id;

    if (!employeeId || !date || !Reason || !mark) {
      return badRequest(res, "All fields are required ");
    }

    const findEmployee = await employeeModel.findById(employeeId);
    if (!findEmployee) {
      return badRequest(res, "Employee not found");
    }

    // Check if a regulation already exists for the given employeeId and date
    const existingRegulation = await regulationModel.findOne({
      employeeId,
      date,
    });
    if (existingRegulation) {
      return badRequest(res, "Request is Already Exists");
    }

    const newRegulation = new regulationModel({
      employeeId,
      date,
      Reason,
      mark,
      reportingManagerId: findEmployee.reportingManagerId,
    });

    await newRegulation.save();
    return success(res, "Regulation added successfully");
  } catch (error) {
    console.error("Error adding regulation:", error);
    return unknownError(res, "An error occurred while adding the regulation");
  }
}

// Get Regulations by employeeId and date //

async function getregulation(req, res) {
  try {
    const { status, page = 1, limit = 100, search = "" } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Match condition for filtering based on status
    const matchCondition = status ? { status } : {};

    // Search condition for employee name or reason
    const searchCondition = search
      ? {
          $or: [
            { "employee.employeName": { $regex: search, $options: "i" } },
            { Reason: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const checkreguation = await regulationModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "reportingManagerId",
          foreignField: "_id",
          as: "reportingManager",
        },
      },
      { $unwind: "$employee" },
      { $unwind: "$reportingManager" },
      { $match: searchCondition },
      {
        $project: {
          employeeName: "$employee.employeName",
          employeeEmail: "$employee.email",
          reportingManagerName: "$reportingManager.employeName",
          date: 1,
          Reason: 1,
          status: 1,
          mark: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]);

    // Counting total records based on status
    const totalCount = await regulationModel.countDocuments(matchCondition);
    const approvedCount = await regulationModel.countDocuments({
      status: "approved",
    });
    const rejectedCount = await regulationModel.countDocuments({
      status: "rejected",
    });
    const pendingCount = await regulationModel.countDocuments({
      status: "pending",
    });

    const counts = {
      total: totalCount,
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
    };

    return success(res, "Regulations fetched successfully", {
      checkreguation,
      counts,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error getting regulations:", error);
    return unknownError(res, "An error occurred while getting the regulations");
  }
}

// Get Regulations by there reporting manager //

async function getRegulationByReportingManager(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const ID = new ObjectId(req.Id); // Convert to ObjectId
    const { status, page = 1, limit = 100, search = "" } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Match condition for filtering based on status
    const matchCondition = { reportingManagerId: ID };
    if (status) matchCondition.status = status;

    // Search condition for employee name or reason
    const searchCondition = search
      ? {
          $or: [
            { "employee.employeName": { $regex: search, $options: "i" } },
            { Reason: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const checkregulation = await regulationModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "reportingManagerId",
          foreignField: "_id",
          as: "reportingManager",
        },
      },
      { $unwind: "$employee" },
      { $unwind: "$reportingManager" },
      { $match: searchCondition },
      {
        $project: {
          employeeName: "$employee.employeName",
          employeeEmail: "$employee.email",
          reportingManagerName: "$reportingManager.employeName",
          date: 1,
          Reason: 1,
          status: 1,
          mark: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]);

    // Counting total records based on status and manager
    const totalCount = await regulationModel.countDocuments({
      reportingManagerId: ID,
    });
    const approvedCount = await regulationModel.countDocuments({
      reportingManagerId: ID,
      status: "approved",
    });
    const rejectedCount = await regulationModel.countDocuments({
      reportingManagerId: ID,
      status: "rejected",
    });
    const pendingCount = await regulationModel.countDocuments({
      reportingManagerId: ID,
      status: "pending",
    });

    const counts = {
      total: totalCount,
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
    };

    return success(res, "Regulations fetched successfully", {
      checkregulation,
      counts,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error getting regulations by reporting manager:", error);
    return unknownError(
      res,
      "An error occurred while getting the regulations by reporting manager"
    );
  }
}

// Approve/Reject Regulation
async function updateRegulationStatus(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { regulationId, status } = req.body;
    const approvedBy = req.Id;

    if (!regulationId || !status || !approvedBy) {
      return badRequest(
        res,
        "All fields are required (regulationId, status, approvedBy)"
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return badRequest(
        res,
        "Invalid status. Allowed values are 'approved' or 'rejected'"
      );
    }

    const findRegulation = await regulationModel.findById(regulationId);
    if (!findRegulation) {
      return badRequest(res, "Regulation not found");
    }

    findRegulation.status = status;
    findRegulation.approvedBy = approvedBy;
    findRegulation.approvalDate = new Date();

    await findRegulation.save();

    return success(res, `Regulation ${status} successfully`);
  } catch (error) {
    console.error("Error updating regulation status:", error);
    return unknownError(
      res,
      "An error occurred while updating the regulation status"
    );
  }
}

async function getRegulationByUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const ID = new ObjectId(req.Id); // Convert to ObjectId
    const { status, page = 1, limit = 10, search = "" } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Match condition for filtering based on status and employeeId
    const matchCondition = { employeeId: ID };
    if (status) matchCondition.status = status;

    // Search condition for Reason
    const searchCondition = search
      ? { Reason: { $regex: search, $options: "i" } }
      : {};

    console.log("Check regulation:", matchCondition);

    const checkregulation = await regulationModel.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "reportingManagerId",
          foreignField: "_id",
          as: "reportingManager",
        },
      },
      { $unwind: "$employee" },
      { $unwind: "$reportingManager" },
      { $match: searchCondition },
      {
        $project: {
          employeeName: "$employee.employeName",
          employeeEmail: "$employee.email",
          reportingManagerName: "$reportingManager.employeName",
          date: 1,
          Reason: 1,
          status: 1,
          mark: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]);

    // Counting total records based on status and employeeId
    const totalCount = await regulationModel.countDocuments({ employeeId: ID });
    const approvedCount = await regulationModel.countDocuments({
      employeeId: ID,
      status: "approved",
    });
    const rejectedCount = await regulationModel.countDocuments({
      employeeId: ID,
      status: "rejected",
    });
    const pendingCount = await regulationModel.countDocuments({
      employeeId: ID,
      status: "pending",
    });

    const counts = {
      total: totalCount,
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
    };

    return success(res, "Regulations fetched successfully", {
      checkregulation,
      counts,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error getting regulations by user:", error);
    return unknownError(
      res,
      "An error occurred while getting the regulations by user"
    );
  }
}

async function sendNoPunchInEmailTest(req, res) {
  try {
    // First, get the data with basic branch and employee info
    let data = await branchModel.aggregate([
      // Filter only active branches
      {
        $match: {
          isActive: true,
          status: "active",
        },
      },

      // Project and format data
      {
        $project: {
          branch_name: "$name",
          // Handle invalid punchin_time and extract only the time portion using regex
          punchin_time: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$punchInTime", null] },
                  { $eq: ["$punchInTime", ""] },
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$punchInTime", ""] },
                      regex: "NaN",
                    },
                  },
                ],
              },
              then: "Unspecified Time",
              else: {
                $let: {
                  vars: {
                    // Extract the time portion using regex
                    timeMatch: {
                      $regexFind: {
                        input: "$punchInTime",
                        regex: "(\\d{1,2}:\\d{2}:\\d{2})(\\s*[AP]M)?",
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $eq: ["$$timeMatch", null] },
                      then: "Unspecified Time",
                      else: "$$timeMatch.match",
                    },
                  },
                },
              },
            },
          },
          punchout_time: "$punchOutTime",
        },
      },

      // Group by punchin_time
      {
        $group: {
          _id: "$punchin_time",
          branches: {
            $push: "$_id",
          },
        },
      },

      // Add back the punch-in time as a regular field
      {
        $project: {
          _id: 0,
          punchin_time: "$_id",
          branches: 1,
        },
      },
    ]);

    let a = await Promise.all(
      data.map(async (branchGroup) => {
        branchGroup.mailData = await getUserToMail(branchGroup.branches);
        return branchGroup;
      })
    );

    return success(
      res,
      "Branches grouped by punch-in time and employees grouped by reporting manager:",
      a
    );
  } catch (error) {
    console.error("❌ Error fetching and grouping branches:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function sendNoPunchOutEmailTest(req, res) {
  try {
    // Get branches with punchOutTime logic
    let data = await branchModel.aggregate([
      {
        $match: {
          isActive: true,
          status: "active",
        },
      },

      {
        $project: {
          branch_name: "$name",
          // Handle invalid punchout_time and extract time portion
          punchout_time: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$punchOutTime", null] },
                  { $eq: ["$punchOutTime", ""] },
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$punchOutTime", ""] },
                      regex: "NaN",
                    },
                  },
                ],
              },
              then: "Unspecified Time",
              else: {
                $let: {
                  vars: {
                    timeMatch: {
                      $regexFind: {
                        input: "$punchOutTime",
                        regex: "(\\d{1,2}:\\d{2}:\\d{2})(\\s*[AP]M)?",
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $eq: ["$$timeMatch", null] },
                      then: "Unspecified Time",
                      else: "$$timeMatch.match",
                    },
                  },
                },
              },
            },
          },
          punchin_time: "$punchInTime",
        },
      },

      {
        $group: {
          _id: "$punchout_time",
          branches: {
            $push: "$_id",
          },
        },
      },

      {
        $project: {
          _id: 0,
          punchout_time: "$_id",
          branches: 1,
        },
      },
    ]);

    // Fetch mailData for each branch group
    let a = await Promise.all(
      data.map(async (branchGroup) => {
        branchGroup.mailData = await getUserToMailPunchOut(
          branchGroup.branches
        );
        return branchGroup;
      })
    );

    return success(
      res,
      "Branches grouped by punch-out time and employees grouped by reporting manager:",
      a
    );
  } catch (error) {
    console.error("❌ Error fetching and grouping punch-out branches:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  employeeAttendance,
  employeeAttendanceActiveByTrueFalse,
  employeePunch,
  employeePunchOutSideBranch,
  employeePunchList,
  punchDetail,
  getEmployeeMonthlyAttendance,
  getAllEmployeesMonthlyAttendance,
  employeePunchApproval,
  getemployeePunchApproval,
  getemployeePunchApprovalHR,
  policyAdd,
  MonthlyAttendance,
  deleteDuplicatesByDate,
  lastWeekAttendence,
  attandaceAcccToDate,
  newMonthlyAttendance,
  sendPunchOutReminder,
  sendNoPunchInEmail,
  sendNoPunchOutEmail,
  getEmployeeByJoiningDate,
  sendAppointmentLetter,
  generateAppointmentLetterPdf,
  addRegulation,
  getregulation,
  getRegulationByReportingManager,
  updateRegulationStatus,
  getRegulationByUser,
  getUserToMail,
  getUserToMailPunchOut,
  sendNoPunchOutEmailTest,
  sendNoPunchInEmailTest,
  getAllEmployeesMonthlyAttendanceTwo,
  deleteAttendance,
  changeToOutside,
  approveChangeAttendace,
  getChangeAttendanceList
};