
const express = require("express");
const router = express.Router();
const { upload } = require("../../../../Middelware/multer");
const {lenderAdd  , lenderUpdate , lenderById , getAllLender , lenderActiveOrInactive, requireLenderDocument,addDocumentTolender,
  lenderCustomerList,esignDocumentTolender , alllenderList , getLenderByPartnerUniqueIdAndCustomerId, deleteLender,
  venderDelete,productDetails,addProduct,lenderDetail,deleteProduct , addPhysicalFileCourierToLender , getPhysicalFileCourierByCustomerIdToLender
} = require("../../api/controller/lender.controller")

router.post("/singup", upload.fields([
    { name: "sanctionLatter", maxCount: 1 },
    { name: "aggrement", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),lenderAdd)


router.post("/update/:lenderId",   upload.fields([
    { name: "sanctionLatter", maxCount: 1 },
    { name: "aggrement", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]), lenderUpdate)

router.get("/detail/:lenderId", lenderById)

// get lender by partner unique id and customer id //
router.get("/getLenderByPartner", getLenderByPartnerUniqueIdAndCustomerId)

router.get("/list", getAllLender)

router.get("/lenderDetail", lenderDetail)

router.get("/active/list",alllenderList)

router.post("/activeOrInactive",lenderActiveOrInactive)

router.post("/delete",deleteLender)

// lender document requirement
router.post("/lenderDocument",requireLenderDocument)

//sanction add lender document api
router.post("/addDocument", addDocumentTolender)

// api for the generate esign document
router.post("/esignDocument", esignDocumentTolender)

//lender user list api
router.post("/lenderCustomerList", lenderCustomerList)

//delete vender
router.post("/venderDelete", venderDelete)

//get product
router.get("/productDetails", productDetails)

//add product
router.post("/addProduct", addProduct)

//delete product
router.post("/deleteProduct", deleteProduct)

router.get("/getPhysicalFileCourierToLender", getPhysicalFileCourierByCustomerIdToLender)
router.post("/addPhysicalFileCourierToLender", addPhysicalFileCourierToLender)


module.exports = router;
 


