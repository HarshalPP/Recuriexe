import { Router } from "express";
import * as dashboardController from "../../controllers/dashboard/dashboard.controller.js";
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";


const dashboardRouter = Router();


dashboardRouter.get("/getAllCount",verifyEmployeeToken, dashboardController.getAllcasescount);

dashboardRouter.get("/adCasesCount",verifyEmployeeToken, dashboardController.getAdCasesData);

dashboardRouter.get("/backOfficeCount",verifyEmployeeToken, dashboardController.getBackofficeCountInfo)

dashboardRouter.get("/backOfficewipCount",verifyEmployeeToken, dashboardController.getBackOfficeWinPCount)
;
dashboardRouter.get("/report",verifyEmployeeToken, dashboardController.getBackofficeDataFroReport);

dashboardRouter.get("/backOfficeCompleteCount",verifyEmployeeToken, dashboardController.getBackOfficeCompleteCount);

dashboardRouter.get("/clientCount",verifyEmployeeToken, dashboardController.getClientCountInfo);

dashboardRouter.get("/taskByEmpCount",verifyEmployeeToken, dashboardController.getTaskCountByEmpInfo);

dashboardRouter.get("/taskByPartnerCount",verifyEmployeeToken, dashboardController.getTaskCountByPartnerInfo);

dashboardRouter.get("/taskByServiceCount",verifyEmployeeToken, dashboardController.getTaskCountByServicesInfo);

dashboardRouter.get("/empcount",verifyEmployeeToken, dashboardController.empCountData);






export default dashboardRouter;


