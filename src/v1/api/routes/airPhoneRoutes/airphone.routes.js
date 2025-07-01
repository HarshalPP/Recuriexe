import express from 'express';

import * as airphoneController from '../../controllers/airphoneController/airphone.controller.js';
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"

const router = express.Router();
import multer from 'multer';
const upload = multer();

//live event APIs
router.post('/live-event/before-connect', airphoneController.beforeCallConnect);
router.post('/live-event/after-connect', airphoneController.afterCallConnect);

//initiate C2C call API
router.post('/initiate-c2c',verifyEmployeeToken, airphoneController.initiateC2C);

//add C2C agent API
router.post('/add-agent',verifyEmployeeToken, airphoneController.addAgent);

//update agent status API
router.post('/update-agent-status', airphoneController.updateAgentStatus);

//get agent status API
router.post('/get-agent-status',upload.none(), airphoneController.getAgentStatus);

//dial call API
router.post('/dial-call',upload.none(), airphoneController.initiateDirectCall);

//get agent number API
router.get('/get-agent-number', airphoneController.getAgentNumber);

//get agent number by ID API
router.post('/get-extension-status/:extension', airphoneController.getSingleExtensionStatus);

//get multiple agent numbers API
router.post('/get-extension-status-multiple/:extensions', airphoneController.getMultipleExtensionStatus);


//get all saved agents API
router.get('/saved-agents',verifyEmployeeToken, airphoneController.getAllSavedAgents);

router.get('/callLog',verifyEmployeeToken, airphoneController.getAgentCallLogs);
router.get('/DashBoard',verifyEmployeeToken, airphoneController.getCallDashboardStats);


router.get('/get/data',verifyEmployeeToken, airphoneController.getAgentByTokenEmployeeId);
router.get('/getScheduledCalls', verifyEmployeeToken, airphoneController.getPendingScheduledCalls);
//get agent by employee ID API
router.get('/:employeeId',verifyEmployeeToken, airphoneController.getAgentsByToken);

//get all c2c calls API
router.get('/saved-c2c-calls', airphoneController.getAllSavedC2CCalls);

//receive call log aPI
router.post('/receive-call-log', upload.none(), airphoneController.receiveCallLog);

//get agent by mobile number API
router.get('/get/:mobile',verifyEmployeeToken, airphoneController.getAgentByMobileParam);


//get agent by employeeId
router.post('/schedule-c2c-calls', verifyEmployeeToken, airphoneController.scheduleC2CCalls);

//updateManyPendingCallSchedules
router.post('/reSheduleCall', verifyEmployeeToken, airphoneController.updateManyPendingCallSchedules);
router.post('/cancelManyCallSchedules', verifyEmployeeToken, airphoneController.cancelManyCallSchedules);

export default router;
