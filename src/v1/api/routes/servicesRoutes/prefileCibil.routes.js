const express = require('express');
const router = express.Router();

const {
    prefillCibil
} = require("../../services/prefileCibil.services");


router.post('/prefillCibil', prefillCibil);

module.exports = router;