import express from "express";
const router = express.Router();

import {
    addNewDropDown,
    getDropDown,
    activeAndInactiveDropDown,
    updateDropDown,
    listDropDown,
    addsubDropDown,
    updateSubDropDown,
    subDropDownGet,
    subDropDownDetail,
    activeAndInactiveSubDropDown,
} from "../../controllers/masterDropDown/masterDropDown.controller.js"

import sectorTypeRoute from "./sectorType.routes.js"
import industryTypeRoute from "./industryType.routes.js"
import organizationTypeRoute from "./organizationType.routes.js"
import branchTypeRoute from "./branchType.routes.js"

import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"

router.post("/add", verifyEmployeeToken, addNewDropDown)
router.get("/detail", verifyEmployeeToken, getDropDown)
router.post("/update", verifyEmployeeToken, updateDropDown)
router.get("/list", verifyEmployeeToken, listDropDown)
router.post("/activeAndInactive", verifyEmployeeToken, activeAndInactiveDropDown)

router.post("/subDropDown/add",verifyEmployeeToken , addsubDropDown)
router.post("/subDropDown/update", verifyEmployeeToken, updateSubDropDown)
router.get("/subDropDown/getList", verifyEmployeeToken, subDropDownGet)
router.get("/subDropDown/detail", verifyEmployeeToken, subDropDownDetail)
router.post("/subDropDown/activeAndInactive", verifyEmployeeToken, activeAndInactiveSubDropDown)


router.use("/sectorType", verifyEmployeeToken, sectorTypeRoute)
router.use("/industryType", verifyEmployeeToken, industryTypeRoute)
router.use("/organizationType", verifyEmployeeToken, organizationTypeRoute)
router.use("/branchType",verifyEmployeeToken ,branchTypeRoute)

export default router;
