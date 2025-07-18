import jwt from "jsonwebtoken";
import User from "../models/AuthModel/auth.model.js"
import Employee from "../models/employeemodel/employee.model.js"
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
} from "../formatters/globalResponse.js"



// Make a middleware function to check if the user is logged in


export const IsAuthenticated = async (req, res, next) => {
    try {
        const authenticationHeader = req.headers.authorization;

        if (!authenticationHeader) {
            return forbidden(res, "Not authorized to access this route");
        }

        const token = authenticationHeader.trim(); // Trim any extra spaces
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = await User.findById(decoded.id);
        if (!user) {
            return sendResponse(res, notFound, "No user found with this ID");
        }

        // Check if the active token matches
        if (!user.activeToken || user.activeToken !== token) {
            return badRequest(res, "Token is not valid");
        }
        user = user.toObject();
        // let permissions = [];
        // if(user.role.toLowerCase() == 'admin'){
        //     permissions = Object.values(PERMISSIONS).flat();
        // }else{
        //     permissions = await  RolePermission.findOne({name:findUser.role}).select('permissions');
        //     permissions = permissions?.permissions ? permissions?.permissions  : [];
        // }
        // user.permissions = permissions;
        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({ status: false, subCode: 500, message: "Something went wrong!" });
    }
};


// VERIFY EMPLOYEE TOKEN //
//    console.log("request" , req.employee.id) //
export const verifyEmployeeToken = (req, res, next) => {
    try {
      const token = req.headers.authorization;
  
      if (!token) {
        return unauthorized(res, 'Authorization token is missing');
      }
      const decoded = jwt.verify(token, process.env.JWT_EMPLOYEE_TOKEN);

      req.employee = {
        id: decoded.Id,
        roleName: decoded.roleName,
        roleId:decoded.roleId,
        organizationId: decoded.organizationId
      };
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return unauthorized(res, 'Invalid or expired token');
    }
  };

 export const authenticateEmployeeAdmin = async (req, res, next) => {
  try {
    const authenticationHeader = req.headers.authorization;

    if (!authenticationHeader) {
      return forbidden(res, "Authorization token missing");
    }

      const decoded = jwt.verify(authenticationHeader, process.env.JWT_EMPLOYEE_TOKEN);

    const { Id, roleName, roleId, organizationId } = decoded;

    // Set basic decoded values into request
    req.employee = { Id, roleName, roleId, organizationId };
    console.log("id",Id)
        console.log("organizationId",organizationId)


    // Check if employee exists and belongs to same org
    const employee = await Employee.findOne({ _id: Id, organizationId });

    if (!employee) {
      return notFound(res, "No employee found with this token");
    }

    // Ensure the role is admin
    // if (roleName.toLowerCase() !== "admin") {
    //   return forbidden(res, "You are not authorized as admin");
    // }
//    const role = Array.isArray(roleName) ? roleName[0]?.toLowerCase() : roleName?.toLowerCase();

// if (role !== "admin") {
//   return forbidden(res, "You are not authorized as admin");
// }



    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      status: false,
      subCode: 401,
      message: "Invalid or expired token",
    });
  }
};



// Make a middleware function to authorize the roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {

            return unauthorized(res, `Role (${req.user.role}) is not allowed to access this resource`);

        }

        next();
    };
};
