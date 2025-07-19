const express = require("express");
const router = express.Router();
const { upload2 } = require('../../../../Middelware/multer')

const {loanCalculator,getCustomerDetail,cibilAndPdStatusUpdate,getProcessDetail, csvToJson , multipleDataUpdate , reqBodyDataInRes , newGetCustomerFilesDetail} = require("../controller/loanCalculator.controller")

router.post("/loanCalculator",loanCalculator)
router.get("/getCustomer",getCustomerDetail)
router.get("/newGetCustomerFilesDetail",newGetCustomerFilesDetail)
router.post("/cibilAndPdStatusUpdate",cibilAndPdStatusUpdate)
router.get("/getProcessDetail/:processId",getProcessDetail)

router.post("/csvToJson", upload2.single('file') , csvToJson)
router.put("/multipleDataUpdate",multipleDataUpdate)
router.post("/bodyData",reqBodyDataInRes)


 module.exports = router;
 