const express = require("express");
const router = express.Router();

const {productAdd,productUpdate, productActiveAndInActive , productActiveOrInactiveList , getAllProduct, productActiveOrInactive,newproductAdd,
    newgetAllProduct,newproductUpdate , productCountAllFiles ,  getAllProductForWebsite} = require("../../controller/adminMaster/product.controller")

router.post("/productAdd",newproductAdd)

router.post("/newproductAdd",newproductAdd)

router.post("/productUpdate",productUpdate)
router.post("/productActiveAndInActive",productActiveAndInActive)
router.post("/newproductUpdate",newproductUpdate)

 router.get("/getProduct",getAllProduct)

 router.get("/fileWiseCount",productCountAllFiles)

 router.get("/getAllProduct",newgetAllProduct)
 router.get("/websiteGetProduct",getAllProductForWebsite)

router.post("/activeOrInactive",productActiveOrInactive)
 
router.get("/activeOrInactiveList",productActiveOrInactiveList)

 module.exports = router;
 