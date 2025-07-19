const express = require('express');
const router = express.Router();
const { registerNach ,  handlecallback , enachStatusCheck , cancelNach , upiAutoPayValidVpa , upiAutoPayRevoke} = require('../../services/e-Nach.services')

router.post('/registerNach', registerNach);
router.post('/handlecallback', handlecallback);
router.post("/CheckStatus", enachStatusCheck);
router.post("/cancelNach", cancelNach);
router.post("/upiAutoPayValidVpa", upiAutoPayValidVpa);
router.post("/upiAutoPayRevoke", upiAutoPayRevoke);
module.exports = router;


