import jwt from "jsonwebtoken";
import User from "../models/AuthModel/auth.model.js"
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
        organizationId: decoded.organizationId
      };
  
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return unauthorized(res, 'Invalid or expired token');
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
