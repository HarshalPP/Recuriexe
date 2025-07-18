import { Router } from 'express';
import {
  createNewVendor,
  getVendors,
  getVendor,
  updateVendor,
  deleteVendor
} from '../../controllers/expenseControllers/vendor.controller.js';

import {
  authenticateEmployeeAdmin,
  verifyEmployeeToken
} from '../../middleware/authicationmiddleware.js';

const vendorRouter = Router();

// Vendor CRUD routes
vendorRouter.get("/all", verifyEmployeeToken, getVendors); // Get all vendors
vendorRouter.post("/", authenticateEmployeeAdmin, createNewVendor); // Create vendor
vendorRouter.get("/:id", verifyEmployeeToken, getVendor); // Get vendor by ID
vendorRouter.put("/:id", authenticateEmployeeAdmin, updateVendor); // Update vendor
vendorRouter.delete("/:id", authenticateEmployeeAdmin, deleteVendor); // Delete vendor (soft delete)

export default vendorRouter;
