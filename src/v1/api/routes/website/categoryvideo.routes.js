const express=require("express");
const router=express.Router();
const {Addcategory,getAllCategory,AddcategoryVideo,deleteCategoryvideo}=require("../../controller/website/categoryVideo.controller");

router.post("/addCategory",Addcategory);
router.get("/getAllCategory",getAllCategory);
router.post("/addvideo",AddcategoryVideo);
router.post("/delete/:categoryId" , deleteCategoryvideo)


module.exports=router;