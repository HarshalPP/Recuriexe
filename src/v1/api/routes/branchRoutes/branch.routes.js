import express from "express"
const router = express.Router();


import {addBranchController , getAllBranchController , getAllBranchdata  , getAllInactiveBranchController ,
     getRegionalBranchController , getBranchByIdController , getBranchByRegionalIdController , updateBranchController ,
      deactivateBranchByIdController , allRegionalBranches , branchesByRegionalBranch , allBranch} from "../../controllers/branchController/branch.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"



router.post("/add" , verifyEmployeeToken, addBranchController);
router.get("/getAll" , getAllBranchController);
router.get("/getAllInactive", verifyEmployeeToken ,getAllInactiveBranchController);
router.get("/branchesByRegionalBranch", verifyEmployeeToken ,branchesByRegionalBranch);
router.get("/allRegionalBranches", verifyEmployeeToken ,allRegionalBranches);
router.get("/getRegional", verifyEmployeeToken , getRegionalBranchController);
router.get("/getBranchById/:branchId", verifyEmployeeToken , getBranchByIdController);
router.get("/getBranchByRegionalId/:branchId", getBranchByRegionalIdController);
router.post("/update", verifyEmployeeToken ,updateBranchController);
router.post("/delete/:branchId", verifyEmployeeToken ,deactivateBranchByIdController);
router.get("/getAllBranchdata" , verifyEmployeeToken , getAllBranchdata);
router.get("/all", verifyEmployeeToken ,allBranch)



export default router;