const express = require("express");
const router = express.Router();

const {sendIndividualMessage,getChatListByUserId ,getChatMessages,emojiUpdateByMessageId,
    deleteMessagesForMe,deleteMyMessagesForBothSide } = require('../../controller/chat/singleChat.controller')
const { createGroupApi , sendMessageToGroup ,getMessageReadStatus} = require('../../controller/chat/groupChat.controller')

// Single One To One Chat Route
router.post('/sendIndividualMessage',sendIndividualMessage)
router.get('/getChatListByUserId', getChatListByUserId)
router.get('/getChatMessages',     getChatMessages)
router.post('/emojiUpdateByMessageId',emojiUpdateByMessageId)
router.post("/deleteMessagesForMe",deleteMessagesForMe)
router.post("/deleteMyMessagesForBothSide",deleteMyMessagesForBothSide)

// Group  Chat Route
router.post('/group/createGroupApi',createGroupApi)
router.post('/group/sendMessageToGroup',sendMessageToGroup)
router.get("/getMessageReadStatus",getMessageReadStatus)



module.exports = router;