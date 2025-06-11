import express from "express";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  deleteOrganization,
  disconnectLinkedIn,
} from "../../controllers/LinkedIn/organization.controller.js";
import {verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"

const router = express.Router();

router.post("/", verifyEmployeeToken,createOrganization);         // POST /api/organizations
router.get("/test",verifyEmployeeToken, getAllOrganizations);         // GET /api/organizations
router.get("/:id",verifyEmployeeToken, getOrganizationById);      // GET /api/organizations/:id
router.delete('/:id',verifyEmployeeToken, deleteOrganization); 
router.delete("/:orgId/linkedin",verifyEmployeeToken, disconnectLinkedIn);

export default router;
