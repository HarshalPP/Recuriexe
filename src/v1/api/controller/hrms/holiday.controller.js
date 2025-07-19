const HolliDayModel = require("../../model/hrms/holiday.model")

// Sunday working model //

const sundayModel = require("../../model/hrms/sundayworking.model")

const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  const moment = require("moment");
  const ObjectId = require("mongoose").Types.ObjectId;



  async function manageHoliday(req, res) {
    try {
      const { title, date, status } = req.body;
  
      // Ensure employeeId is correctly assigned
      const employeeId = req.Id; // Assuming `req.Id` is set correctly via middleware
  
      // Format the date to a standard format (optional, based on your schema)
      const formattedDate = moment(date).format("YYYY-MM-DD");
  
      // Use `findOneAndUpdate` to upsert the holiday record
      const holiday = await HolliDayModel.findOneAndUpdate(
        { date: formattedDate }, // Match by formatted date
        { title, date: formattedDate, employeeId, status }, // Update or insert these fields
        { new: true, upsert: true } // Return the updated document and allow insert if not found
      );
  
      // Prepare the response object
      const response = {
        title: holiday.title,
        date: holiday.date,
        status: holiday.status,
        employeeId: holiday.employeeId,
      };
  
      return success(res, "Holiday added/updated successfully", response);
    } catch (error) {
      return unknownError(res, error);
    }
  }
  



  // get all holidays //

    async function getAllHolidays(req, res) {
        try {
          const holidays = await HolliDayModel.find({})
            .populate("employeeId", "employeName")
          .sort({ date: -1 });

        
          return success(res, "Data fetched successfully", holidays);
        } catch (error) {
          return unknownError(res, error);
        }
      } 



// get all holidays by id // 

async function getHolidayById(req, res) {
    try {
      const { id } = req.query;
  
      if (!id) {
        return serverValidation(res, "Missing required query parameter: id");
      }
  
      const holiday = await HolliDayModel.findById(id);
  
      if (!holiday) {
        return badRequest(res, "Holiday not found.");
      }
  
      return success(res, "Data fetched successfully", holiday);
    } catch (error) {
      return unknownError(res, error);
    }
  }


  // delete holiday by id //

    async function deleteHoliday(req, res) {
        try {
          const { id } = req.query;
      
          if (!id) {
            return serverValidation(res, "Missing required query parameter: id");
          }
      
          const holiday = await HolliDayModel.findByIdAndDelete(id);
      
          if (!holiday) {
            return badRequest(res, "Holiday not found.");
          }
      
          return success(res, "Holiday deleted successfully");
        } catch (error) {
          return unknownError(res, error);
        }
      }




      async function managesunday(req, res) {
        try {
          const { title, date, status, department, departmentSelection } = req.body;

          if (!date || !department) {
            return badRequest(res, "Please provide both the Date and Department.");
          }
      
          const employeeId = req.Id;
      

          const formattedDepartments = department.map(dept => ({
            departmentId: dept.departmentId || null,
          }));
      
          // Find and update or insert the record
          const holiday = await sundayModel.findOneAndUpdate(
            { date }, // Search by date
            {
              title,
              date,
              employeeId,
              status: status || "active", // Use "active" as the default status
              department: formattedDepartments,
              departmentSelection,
            },
            { new: true, upsert: true } // Return the updated document or insert a new one
          );
      
          // Prepare the response
          const response = {
            title: holiday.title,
            date: holiday.date,
            status: holiday.status,
            employeeId: holiday.employeeId,
            departments: holiday.department,
            departmentSelection: holiday.departmentSelection,
          };
      
          return success(res, "Sunday added/updated successfully", response);
        } catch (error) {
          console.error(error);
          return unknownError(res, error);
        }
      }
    
    
    
      // get all holidays //
    
      async function getsunday(req, res) {
        try {
          const holidays = await sundayModel.aggregate([
            {
              $lookup: {
                from: "newdepartments", // Collection name for the `newdepartment` model
                localField: "department.departmentId",
                foreignField: "_id",
                as: "departmentDetails",
              },
            },
            {
              $lookup: {
                from: "employees", // Collection name for the `employee` model
                localField: "employeeId",
                foreignField: "_id",
                as: "employeeDetails",
              },
            },
            {
              $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true }, // Unwind employee details
            },
            {
              $project: {
                title: 1,
                date: 1,
                status: 1,
                departmentDetails: {
                  _id: 1,
                  name: 1, // Assuming the department name field is `name`
                },
                employeeDetails: {
                  _id: 1,
                  employeName: 1, // Assuming the employee name field is `employeName`
                },
              },
            },
            { $sort: { date: -1 } }, // Sort by date descending
          ]);
      
          // Respond with success and fetched data
          return success(res, "Data fetched successfully", holidays);
        } catch (error) {
          // Handle errors and respond
          console.error("Error in getsunday:", error);
          return unknownError(res, error);
        }
      }
      
      
    
    
    
    // get all holidays by id // 
    
    async function getsundaybyid(req, res) {
        try {
          const { id } = req.query;
      
          if (!id) {
            return serverValidation(res, "Missing required query parameter: id");
          }
      
          const holiday = await sundayModel.findById(id);
      
          if (!holiday) {
            return badRequest(res, "Sunday not found.");
          }
      
          return success(res, "Data fetched successfully", holiday);
        } catch (error) {
          return unknownError(res, error);
        }
      }
    
    
      // delete holiday by id //
    
        async function deletesunday(req, res) {
            try {
              const { id } = req.query;
          
              if (!id) {
                return serverValidation(res, "Missing required query parameter: id");
              }
          
              const holiday = await sundayModel.findByIdAndDelete(id);
          
              if (!holiday) {
                return badRequest(res, "Sunday not found.");
              }
          
              return success(res, "Sunday deleted successfully");
            } catch (error) {
              return unknownError(res, error);
            }
          }
    


        module.exports ={
            manageHoliday,
            getAllHolidays,
            getHolidayById,
            deleteHoliday,
            deletesunday,
            getsundaybyid,
            getsunday,
            managesunday
        }
    
  
  