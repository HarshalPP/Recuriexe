const express = require("express");
const router = express.Router();

const {
    addFormConfigController,
    getFormConfigByIdController,
    getFormConfigByNameController,
    getAllActiveFormConfigsController,
    updateFormConfigController,
    deactivateFormConfigController,
    getAllActiveFormConfigsOfCreatorController
} = require("../../controller/config/form.config.controller");

router.post("/form/add", addFormConfigController);
router.get("/form/getById/:formConfigId", getFormConfigByIdController);
router.get("/form/getByName/:formName", getFormConfigByNameController);
router.get("/form/assigned", getAllActiveFormConfigsOfCreatorController);
router.get("/form/getAllActive", getAllActiveFormConfigsController);
router.post("/form/update/:formConfigId", updateFormConfigController);
router.post("/form/deactivate/:formConfigId", deactivateFormConfigController);

module.exports = router;
