import express from 'express'
const router = express.Router();

import {createAgencyClient , getAllAgencyClients , getAgencyClientById , updateAgencyClient , deleteAgencyClient , assignMultipleCandidatesToClient , getAssignedCandidatesToClients} from "../../controllers/AgencyController/agency.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"



router.post("/createAgencyClient" , verifyEmployeeToken , createAgencyClient)
router.get("/getAllAgencyClients" ,  verifyEmployeeToken , getAllAgencyClients)
router.get("/getAgencyClientById/:id" , verifyEmployeeToken , getAgencyClientById)
router.post("/updateAgencyClient/:id" , verifyEmployeeToken ,updateAgencyClient)
router.post("/deleteAgencyClient/:id" , verifyEmployeeToken , deleteAgencyClient)
router.post("/assignMultipleCandidatesToClient" , verifyEmployeeToken , assignMultipleCandidatesToClient)
router.get("/getAssignedCandidatesToClients" , verifyEmployeeToken , getAssignedCandidatesToClients)


export default router;