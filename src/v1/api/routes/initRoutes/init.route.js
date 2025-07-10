import express from "express";
import * as initController from "../../controllers/initController/init.controller.js";
import uploads from "../../middleware/multer.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const initRouter = express.Router();

// Create Init
initRouter.post("/add",verifyEmployeeToken ,initController.saveInit);

// Update Init
initRouter.post("/update",verifyEmployeeToken, initController.updateInit);

initRouter.get("/iniated-data",verifyEmployeeToken, initController.getIniatedDataInfo);

initRouter.get("/backoffice-emp",verifyEmployeeToken, initController.getBackOfficeInfo);

initRouter.get("/invoice-data",verifyEmployeeToken, initController.invoiceDataInfo);

initRouter.get("/invoice-dashboard",verifyEmployeeToken, initController.invoiceCount);

initRouter.get("/files",verifyEmployeeToken, initController.filesData);

initRouter.post("/allocate",verifyEmployeeToken, initController.empManyAllocation);

// Get Init by ID
initRouter.get("/get/:id",verifyEmployeeToken, initController.getInit);

initRouter.get("/dashboard-count",verifyEmployeeToken, initController.dashboardCount);

// Get all Inits
initRouter.get("/all",verifyEmployeeToken, initController.getAllInit); // unallocated   

initRouter.get("/all-filtered",verifyEmployeeToken, initController.getAllFiltered); // all with filter

initRouter.get("/all-allocated",verifyEmployeeToken, initController.getAllAllocatedInitData); // allocated

initRouter.get("/all-unfiltered",verifyEmployeeToken, initController.getAllUnfiltered); // get all

initRouter.get("/allcompleted",verifyEmployeeToken, initController.getAllInitCompleted);

initRouter.get("/allbyemp",verifyEmployeeToken, initController.getInitByEmp); // un iniated

initRouter.get("/allbyemp-filtered",verifyEmployeeToken, initController.getIniatedFiltered); // iniiated filtered

initRouter.get("/all-initiated-emp",verifyEmployeeToken, initController.getJobCreatedInit); //  iniated

initRouter.get("/all-initiated",verifyEmployeeToken, initController.getAllIniatited); //  all unfiltered

initRouter.get("/init-dashboard",verifyEmployeeToken, initController.getAllIniatitedDashboard); //  dashboard

initRouter.get("/generate",verifyEmployeeToken, initController.generateExcelSheet);

initRouter.post("/read",verifyEmployeeToken,uploads.single("sheet"), initController.readSheet);

// Get all Inits by Service ID (user-specific)
initRouter.get("/init-by-service",verifyEmployeeToken, initController.getAllInitByServiceId);

export default initRouter;
