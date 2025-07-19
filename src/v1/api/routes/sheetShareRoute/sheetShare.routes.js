const express = require("express");
const router = express.Router();


const {
  createSheetShareController,
  getAllSheetSharesController,
  getSheetShareByIdController,
  updateSheetShareByIdController,
  deleteSheetShareByIdController,
  getSheetShareOfUserController,
  getSharedSheetWithUserController
} = require("../../controller/sheetShare/sheetShare.controller");

router.post("/createSheetShare",  createSheetShareController);
router.get("/getAllSheetShares", getAllSheetSharesController);
router.get("/getUserSheet", getSheetShareOfUserController);
router.get("/getSharedSheet", getSharedSheetWithUserController);
router.get("/getSheetShareDetail/:id", getSheetShareByIdController);
router.post("/updateSheetShare/:id", updateSheetShareByIdController);
router.post("/deleteSheetShare/:id", deleteSheetShareByIdController);

module.exports = router;
