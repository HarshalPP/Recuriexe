import express from "express";
const router = express.Router();
import {verifyDocument , verifybyId} from "../../services/verificationsuitservices/verificationsuit.service.js"

import {createVerificationAPI , getAllVerificationAPIs , getVerificationAPIById , updateVerificationAPI , deleteVerificationAPI} from  "../../controllers/verificationController/verification.controller.js"
import {createStage , getAllStages , getStageById , updateStage , deleteStage} from "../../controllers/stageController/stage.controller.js"

import {createDocument , getDocuments , deleteDocument , updateDocument } from "../../controllers/verificationController/document.controller.js"



// Document setUp //

router.post("/createDocument" , createDocument)
router.get("/getDocuments" , getDocuments)
router.post("/deleteDocument/:id" , deleteDocument)
router.post("/updateDocument/:id" , updateDocument)




router.post("/verifyDocument" , verifyDocument)
router.get("/verifybyId" , verifybyId)


// get list of api //

router.post("/createVerificationAPI" , createVerificationAPI),
router.get("/getAllVerificationAPIs" , getAllVerificationAPIs),
router.get("/getVerificationAPIById/:id" , getVerificationAPIById)
router.post("/updateVerificationAPI" , updateVerificationAPI)
router.post("/deleteVerificationAPI" , deleteVerificationAPI)



// stage setUp //
// CREATE
router.post("/stage", createStage);

// READ ALL
router.get("/stage", getAllStages);

// READ SINGLE
router.get("/stage/:id", getStageById);

// UPDATE
router.post("/Updatestage/:id", updateStage);

// DELETE
router.post("/deletestage/:id", deleteStage);

export default router;