import express from "express"
const router = express.Router();
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"


import {
    createPortal,
    getAllPortals,
getPortalById,
updatePortal,
deletePortal,
getAll
} from "../../controllers/portalController/portal.controller.js"



router.post("/create" , verifyEmployeeToken , createPortal)
router.get("/getAllPortals"  , getAllPortals)

router.get("/checkPortalstatus" , getAll)
router.get("/getPortalById/id" ,verifyEmployeeToken, getPortalById)
router.post("/updatePortal/:id" ,verifyEmployeeToken ,  updatePortal)
router.post("/deletePortal/:id" , verifyEmployeeToken , deletePortal)

export default router;

