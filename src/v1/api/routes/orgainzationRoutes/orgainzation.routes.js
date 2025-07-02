import express from "express";

// // OrganizationType Routes //
// import {
//   createOrgType,
//   getOrgTypes,
//   updateOrgType,
//   deleteOrgType,
// } from "../../controllers/OrganizationController/organizationType.controller.js"


// Organizatio setUp // 
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getCurrencyList,
  checkOrganizationValid,
  getOrganizations,
  updateOrganizationPermission,
} from "../../controllers/OrganizationController/organizationType.controller.js"

import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const router = express.Router();


// OrganizationType SetUp //
// router.post("/organizationType", createOrgType);
// router.get("/organizationType", getOrgTypes);
// router.post("/updateOrganization/:id", updateOrgType);
// router.post("/deleteOrganization/:id", deleteOrgType);


// Organization SetUp //

router.post("/organization", createOrganization);
router.get("/organization",  verifyEmployeeToken ,getAllOrganizations);
router.get("/organization/:id", getOrganizationById);
router.post("/updateOrganizationType/:id", updateOrganization);
router.get("/getCurrency",getCurrencyList)
router.get("/checkOrganizationValid/:organizationId", checkOrganizationValid);
router.get("/getOrganizations", verifyEmployeeToken , getOrganizations);
router.post("/permissionUpdate" ,updateOrganizationPermission )
// router.post("/deleteOrganizationType/:id", deleteOrganization);

export default router;
