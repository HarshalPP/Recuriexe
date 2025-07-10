import * as userProductController from "../../controllers/userProduct/userProduct.controller.js";

import {Router} from "express";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";



const userProductRouter = Router();


userProductRouter.post("/add",verifyEmployeeToken,userProductController.saveUserProduct);

userProductRouter.post("/update",verifyEmployeeToken,userProductController.updateUserProductInfo);

userProductRouter.post("/remove",verifyEmployeeToken,userProductController.deleteUserProduct);

userProductRouter.get("/get/:productId",verifyEmployeeToken,userProductController.getUserProductInfo);

userProductRouter.get("/all",verifyEmployeeToken,userProductController.getAllUserProductInfo);

userProductRouter.get("/allbyservices",verifyEmployeeToken,userProductController.getAllUserProductInfoByServiceRef);

userProductRouter.get("/allunselect",verifyEmployeeToken,userProductController.getAllUserUnselectedInfo);

userProductRouter.get("/productnotinemp",verifyEmployeeToken,userProductController.getAllProductNotInEmp);

export default userProductRouter;