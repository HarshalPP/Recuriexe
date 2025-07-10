import express,{ Router } from 'express';
const jobRouter = Router();
import * as jobController from "../../controllers/jobController/job.controller.js";
import {uploadByExcel} from "../../middleware/multerXcel.js"
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';
jobRouter.get("/getpartnerproduct",verifyEmployeeToken,jobController.getPartnerProduct);

jobRouter.post("/add",verifyEmployeeToken,jobController.createJob);

jobRouter.post("/fetchaidata",verifyEmployeeToken,jobController.fetchAiData);

jobRouter.post("/addcaseaidata",verifyEmployeeToken,jobController.fetchAiDataForAddCase);

jobRouter.post("/fetchaidataemp",verifyEmployeeToken,jobController.fetchAiDataEmp);

jobRouter.post("/addjobbyexcel",verifyEmployeeToken,uploadByExcel.single("job"),jobController.createJobForExcel);

jobRouter.get("/all",verifyEmployeeToken,jobController.getAllJobIfo);

jobRouter.post("/allocate",verifyEmployeeToken,jobController.allocateJob);

jobRouter.get("/allocatedjob",verifyEmployeeToken,jobController.allAllocatedJob);

jobRouter.get("/job-count",verifyEmployeeToken,jobController.getAllJobCount);

jobRouter.post("/reallocate",verifyEmployeeToken,jobController.reAllocateJob);

jobRouter.post("/update",verifyEmployeeToken,jobController.updateJobOnly);

jobRouter.get("/reset",verifyEmployeeToken,jobController.resetJobById);

jobRouter.post("/acceptallocation",verifyEmployeeToken,jobController.acceptAllicatorJob);

jobRouter.post("/acceptEmpJob",verifyEmployeeToken,jobController.acceptEmpJob);

jobRouter.post("/updatemyjob",verifyEmployeeToken,jobController.updateMYJobOnly);

jobRouter.post("/updatesatge",verifyEmployeeToken,jobController.updateJobSTageInfo);

jobRouter.get("/get/:jobId",jobController.getJobIfo)

jobRouter.get("/getsamplesheet",verifyEmployeeToken,jobController.getSampleSheet)

jobRouter.get("/getMyJob",verifyEmployeeToken,jobController.getMyJobByPartnerId)
-
jobRouter.get("/getMyPendingJob",verifyEmployeeToken,jobController.getAllocationPendingjob)

jobRouter.get("/getMyAcceptedJob",verifyEmployeeToken,jobController.getAllocationAcceptedJob)

jobRouter.get("/getEmpJob",verifyEmployeeToken,jobController.getMyJobByEmployeeId)

jobRouter.get("/getempcompletedJob",verifyEmployeeToken,jobController.getMyCompletedJobInfoByEmployeeId)

jobRouter.get("/getEmpPendingJob",verifyEmployeeToken,jobController.getMyPendingJobByEmployeeId)

jobRouter.get("/getfinaljob",verifyEmployeeToken,jobController.getAllFinalizeJob)

jobRouter.get("/raiseexcel",verifyEmployeeToken,jobController.raiseFinalCaseExcel)

jobRouter.delete("/remove/:jobId",jobController.removeJob);

export default jobRouter;