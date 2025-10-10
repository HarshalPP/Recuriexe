import express from 'express';
const router = express.Router();

import senderRouter from "./mailSender.routes.js"
import contentRouter from "./mailContent.routes.js"
import mailSwitchRouter from "./mailSwtich.routes.js"

router.use("/sender", senderRouter)

router.use("/content" , contentRouter)

router.use("/switch", mailSwitchRouter)


export default router;
