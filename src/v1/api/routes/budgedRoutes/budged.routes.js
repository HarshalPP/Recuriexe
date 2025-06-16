import express from "express"
const router = express.Router()

import {setOrganizationBudget , UpdateOrganizationBudget ,  getOrganization , allocateDepartmentBudget ,
     getDepartmentWiseBudgets , updateDepartmentBudget , getBudgetDashboard , getBudgetAnalytics ,
      manBudgetDashboardApi , getSetBudgetDesingation , manBudgetDashboard , budgetVerify , 
      bulkUpdateDepartmentBudgetsByIds , 
     } from "../../controllers/budgedController/budged.controller.js"
import { IsAuthenticated , verifyEmployeeToken  } from "../../middleware/authicationmiddleware.js";


// set Up Orgainzation Budget //

router.post("/setOrganizationBudget" , verifyEmployeeToken ,  setOrganizationBudget)
router.post("/UpdateOrganizationBudget" ,verifyEmployeeToken ,UpdateOrganizationBudget )
router.get("/getOrganization" , verifyEmployeeToken , getOrganization)


router.post("/getBudgetDetail" , verifyEmployeeToken , getSetBudgetDesingation)

router.get('/manBudgetDashboard' ,verifyEmployeeToken , manBudgetDashboard)
// Budged with Department wise //
router.get("/budgetVerify", verifyEmployeeToken , budgetVerify)
router.post("/allocateDepartmentBudget" , verifyEmployeeToken , allocateDepartmentBudget)
router.get("/budgetDashboard" , verifyEmployeeToken , manBudgetDashboardApi)
router.get("/getDepartmentWiseBudgets" , verifyEmployeeToken , getDepartmentWiseBudgets)
router.post("/updateDepartmentBudget/:budgetId" , verifyEmployeeToken , updateDepartmentBudget)
router.post("/bulkUpdateBudgetsByIds" , verifyEmployeeToken , bulkUpdateDepartmentBudgetsByIds)


// Budged Dashboard and Analytics //
router.get("/getBudgetDashboard" , verifyEmployeeToken , getBudgetDashboard)
router.get("/getBudgetAnalytics" , verifyEmployeeToken , getBudgetAnalytics)



export default router;

