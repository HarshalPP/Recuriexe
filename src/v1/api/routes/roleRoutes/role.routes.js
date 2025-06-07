import express from "express";
const router = express.Router();

import {
  roleAdd,
  getAllRole,
  updateRole,
  roleActiveOrInactive,
  getAllRoleByType,
  getCollectionRoleEmploye,
  getRoleDropDown,
} from "../../controllers/RoleController/role.controller.js"


import {
  createPermission,
  getAllPermissions,
  deletePermission
} from "../../controllers/RoleController/permission.controller.js"
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";



router.post("/addPermission", createPermission);
router.get("/gerPermission", getAllPermissions);
router.post("/deletePermission/:id", deletePermission);

router.post("/roleAdd",verifyEmployeeToken, roleAdd);
router.get("/getRoleDropDown",verifyEmployeeToken, getRoleDropDown);
router.get("/getAllRole", verifyEmployeeToken, getAllRole);
router.post("/roleUpdate",verifyEmployeeToken, updateRole);
router.post("/activeOrInactive",verifyEmployeeToken, roleActiveOrInactive);
router.get("/getAllRoleByType", getAllRoleByType);
router.get("/collectionRoleEmploye", getCollectionRoleEmploye);

export default router;
