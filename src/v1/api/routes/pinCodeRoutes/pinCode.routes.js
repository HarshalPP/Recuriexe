import express from "express";
import {
//   addPinCode,
  getPinCodeList,
} from "../../controllers/pinCodeController/pinCode.controller.js";

const router = express.Router();

// router.post("/add", addPinCode);
router.get("/fetch", getPinCodeList);

export default router;
