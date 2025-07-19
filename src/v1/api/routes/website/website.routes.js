const express = require("express");
const router = express.Router();

const {
  addContactUS,
  getContactUS,
  addbusinessContact,
  getbusinessContact,
  deletebusinessContact,
  addPatnersDetail,
  getPatnersDetail,
  deletePatnersDetail,
  addPatnershipRequest,
  getPatnershipRequest,
  addBranchMapDetail,
  getBranchMapDetail,
  deleteBranchMap,
  websiteActiveInactiveEmployee,
  addDsa,
getAllDsa,
getDsaById,
updateDsa,
deleteDsa

} = require("../../controller/website/website.controller");

router.post("/addContactUS", addContactUS);
router.get("/getContactUS", getContactUS);
router.post("/addbusinessContact", addbusinessContact);
router.get("/getbusinessContact", getbusinessContact);
router.post("/deletebusinessContact", deletebusinessContact);
router.post("/addPatnersDetail", addPatnersDetail);
router.get("/getPatnersDetail", getPatnersDetail);
router.post("/deletePatnersDetail", deletePatnersDetail);
router.post("/addPatnershipRequest", addPatnershipRequest);
router.get("/getPatnershipRequest", getPatnershipRequest);
router.post("/addBranchMapDetail", addBranchMapDetail);
router.get("/getBranchMapDetail", getBranchMapDetail);
router.post("/deleteBranchMap", deleteBranchMap);
router.post("/websiteListingStatus", websiteActiveInactiveEmployee);





/// ------------ DSA Routes ---------------///

router.post("/addDsa", addDsa);
router.get("/getAllDsa", getAllDsa);
router.get("/getDsaById/:id", getDsaById);
router.post("/updateDsa/:id", updateDsa);
router.post("/deleteDsa/:id", deleteDsa);


module.exports = router;
